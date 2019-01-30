var css = "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>\nbody{\nbackground:url(logo.png) no-repeat center 15px;margin-top:100px;}\n pre{ background: #fff;\nborder: 1px solid #ccc;\n box-shadow: 3px 6px 4px #ddd;\n display: block;\n min-width: 296px;\n margin: 0 9px;\n padding:33px 10px;\n white-space: pre-wrap;\n text-align: justify;\n}\n a { background: #444;\n color: white;\n display: block;\n padding: 15px;\n text-align: center;\n text-decoration: none;\n margin: 12px 8px;}\nh4{ border-bottom: 1px solid #ccc;\ncolor: #555;\npadding: 10px 0;}</style>\n";
var config = {
    "pdf_path": "/home/USER/PDF/",
    "salt": "YOUR-OWN-SALT-HERE",
    "table_count": 15,
    "user": {
        name: "user",
        pwd: "pwd"
    },
    "promptpayNumber": '', // Leave empty to disable
    "expire": 300,
    "port": 3000,
    "str_takeaway": '*TAKE OUT*',
    "regex_table": /Table#: \[([\d, ]+)\]/g,
    "regex_check": /CHK#: ([\d, ]+)/g,
    "regex_total": /Total $ ([\d,.]+)/g,
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
