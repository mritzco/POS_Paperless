var css = "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>\nbody{\nbackground:url(logo.png) no-repeat 30px 15px;margin-top:100px;}\npre{ background: #fff none repeat scroll 0 0;\nborder: 1px solid #ccc;\nbox-shadow: 3px 6px 4px rgba(0, 0, 0, 0.36);\ndisplay: block;\nmax-width: 270px;\npadding: 33px 25px;white-space: pre-wrap;}\na{background: #444;\n color: white;\n display: block;\n padding: 15px;\n text-align: center;\n text-decoration: none;\n width: 292px;margin:3px 0;}\nh4{ border-bottom: 1px solid #ccc;\ncolor: #555;\npadding: 10px 0;}</style>\n";
var config = {
    "pdf_path": "/home/USER/PDF/",
    "salt": "YOUR-OWN-SALT-HERE",
    "table_count": 15,
    "user": {
        name: "user",
        pwd: "pwd"
    },
    "promptpayNumber": '', // Leave empty to disable
    "email": {
        from: '',
        subject: '',
        content:''
    },
    "envelope" : {
      debug: true,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      SSL: true,
      auth: {
        user: '',
        pass: ''
      },
      maxConnections: 5,
      maxMessages: 10
    },
    "expire": 300,
    "port": 3000,
    "str_takeaway": '*TAKE OUT*',
    "regex_table": /Table#: \[([\d, ]+)\]/g,
    "regex_check": /CHK#: ([\d, ]+)/g,
    "regex_total": /Total: ([\d,.]+)/g,
    "css": css,
    "msg":{
        "illegal":  css + "<pre>Incorrect code, please try scanning your NFC tag again</pre>",
        "notReady":  css + "<pre>Receipts are only available after you order your bill</pre>",
        "textReceipt":  css + "<pre>%s</pre>",
        "button": "<a href=\"/%s\">%s</a>",
        "service": "<h4>Available receipts:</h4>",
        "newReceipt": 'Receipt added for table: %s, code: %s',
        "takeaway": "Take away: ",
        "serving": 'Receipts delivery on port: %s'
    }
};
module.exports = config;
