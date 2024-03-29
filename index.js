/**
 * Required modules
 * @type {class}
 */
var pdfUtil = require('pdf-to-text'),
    util = require('util'),
    path = require('path'),
    config = require("./config.js"),
    basicAuth = require("basic-auth"),
    Hashids = require('hashids'),
    hashids = new Hashids(config.salt),
    qr = require('qr-image'),
    express = require('express'),
    app = express(),
    chokidar = require('chokidar'),
    generatePayload = require('promptpay-qr'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport(smtpTransport(config.envelope));
    receipts = {};

var methods = {
    isInt: function isInt(value) {
      if (isNaN(value)) {
        return false;
      }
      var x = parseFloat(value);
      return (x | 0) === x;
    },
    encode: function getId(table) {
        return methods.isInt(table) ? hashids.encode(table): table;
    },
    decode: function decode(hash) {
        var id = hashids.decode(hash);
        return (id.length === 1) ? id[0]: hash;
    }

};

var routes = {
    auth: function (req, res, next) {
        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        var user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        }
        if (user.name === config.user.name && user.pass === config.user.pwd) {
            return next();
        } else {
            return unauthorized(res);
        }
    },
    /**
     * Parses the hash, locates the table and sets the ID for next methods
     * @param  {object}   req  request object
     * @param  {object}   res  response object
     * @param  {Function} next pass control to next express router
     * @return {null}
     */
    validate: function(req, res, next){

        var id = methods.decode(req.params.hash);

        if (!id) {
            return res.send(config.msg.illegal);
        }
        // if data is available, check expiration
        if (receipts.hasOwnProperty(id)) {
            var time = process.hrtime(receipts[id].created).join('.');
            if (time > config.expire) {
                delete receipts[id];
                return res.send(config.msg.notReady);
            }
            req.id = id;
            next();
        } else {
            return res.send(config.msg.notReady);
        }
    },
    textReceipt: function (req, res) {
        var btns;
        if (req.headers.referer === undefined || req.headers.referer.indexOf('service') === -1 ) {
            btns = [util.format(config.msg.button, 'pdf/' + req.params.hash, 'PDF' )];
        } else {
            btns =
                [util.format(config.msg.button, 'qr/' + req.params.hash, 'QR Code')];
            if (config.promptpayNumber) btns.push(
                util.format(config.msg.button, 'pay/' + req.params.hash, 'Promptpay')
            );
        }
        btns.push(util.format(config.msg.button, 'service', 'Back'));
        return res.send(util.format(
            config.msg.textReceipt,
            receipts[req.id].text,
            btns.join("\n")));
    },
    pdfReceipt: function(req, res) {
        res.sendFile(path.join(config.pdf_path, receipts[req.id].name));
    },
    qrcode: function(req,res) {
        var code = qr.image( 'http://' + req.hostname + ':' + config.port + '/' + req.params.hash, {type: 'svg'});
        res.type('svg');
        code.pipe(res);
    },
    promptpay: function (req,res) {
        let id = methods.decode(req.params.hash),
            text = receipts[req.id].text,
            r = config.regex_total.exec(text);

        if (r === null || r.length < 2) {
            return res.send(config.msg.wrongFormat);
        }

        let amount = Number(r[1].replace( /,/g, '' ));
        let payload = generatePayload(config.promptpayNumber, {amount});
        var qrcode = qr.image( payload, {type: 'svg'});
        res.type('svg');
        qrcode.pipe(res);
    },
    debug: function(req, res) {
        var tmp = { tables: {}, receipts: receipts};
        for (var i = 1; i < config.table_count+1; i++) {
            tmp.tables[i] = hashids.encode(i);
        }
        res.send('<pre>'+ JSON.stringify(tmp,null,2)+'</pre>');
    },
    illegal: function(req, res) {
        res.send(config.css + config.msg.illegal);
    },
    service: function(req,res) {
        var tmp = [config.css, config.msg.service ];
        Object.keys(receipts).forEach(function(id) {
            var time = process.hrtime(receipts[id].created).join('.');
            if (time > config.expire) {
                delete receipts[id];
            } else {
                var hash = methods.encode(id);
                tmp.push(util.format(config.msg.button, hash, id ));
            }
        });
        res.send(tmp.join("\n"));
    }
};
/**
 * Serves tickets
 * @type {[type]}
 */
app.use(express.static('images'));
app.get('/service',[routes.auth, routes.service]);
app.get('/debug',[routes.auth, routes.debug]);
app.get('/:hash', [routes.validate, routes.textReceipt]);
app.get('/pdf/:hash', [routes.validate, routes.pdfReceipt]);
app.get('/qr/:hash', [routes.validate, routes.qrcode]);
app.get('/pay/:hash', [routes.validate, routes.promptpay]);

app.all(/^(.*)$/, routes.illegal);
app.listen(config.port, function () {
  console.log(config.msg.serving, config.port);
});

var mailer = {
    send: function(to, id) {
        var mailOptions = {
          from: config.email.from, // sender address
          to: to, // list of receivers
          subject: config.subject,
          html: config.content
        };
        // add attachment
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            callback(error);
          } else {
            callback(null, info.response);
          }
        });
    }
}

var pdf = {

    /**
     * Adds a receipt to dataset if valid
     * @param  {string} filename name of the last saved pdf
     * @return {null}
     */
    makePublic: function(filename){
    console.log('[makePublic]', filename),
        pdfUtil.pdfToText(
            filename,{},
            (err, data) => {
                //console.log(err, data);
                var table = pdf.parseTable(data);
                if (!table) return false;
                receipts[table] =  {
                    name: filename,
                    created: process.hrtime(),
                    text: data
                };
                console.log(config.msg.newReceipt, table, methods.encode(table));
            }
        );
    },
    /**
     * Uses a config.regex to find the table number or a check number
     * @param  {string} text content of pdf file
     * @return {int}      table number or false
     */
    parseTable: function(text){
        if (!text) return false;
        var isTable = text.indexOf(config.str_takeaway) === -1;
        var use_regex = isTable ? config.regex_table : config.regex_check;

        use_regex.lastIndex = 0;
        var r = use_regex.exec(text);

        if (r === null || r.length < 2) {
            return false;
        }
        return (isTable ? '' : config.msg.takeaway) + r[1];
    }
};
/**
 * Validates it's a file
 * @param  {object}   event
 * @return {nothing}       [description]
 */
var onFileChange = function(filepath) {
    pdf.makePublic(filepath);
};


const watcher = chokidar.watch(`${config.pdf_path}/*.pdf`, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  ignoreInitial: true,
  persistent: true
});
watcher
  .on('add', onFileChange)
  .on('change', onFileChange)

console.log('Watching]', config.pdf_path);
