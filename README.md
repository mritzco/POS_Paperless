#Paperless POS

Allow POS systems to go paperless.

Tested with Floreant POS but should work with any system that can print receipts to a PDF printer.

###Prerequisites:
- Configure Cups PDF printer
- Setup POS to print receipts to PDF

###Install:
- Clone repo
- Configure
- Install dependencies
- Run

## Configure
Copy or rename:

    config.sample.js to config.js

Change the following values:
````js
"pdf_path": "[YOUR PATH, maybe: /home/user/PDF]",
"salt": "Any string here",
"table_count": 15,
"user": {
    name: "username",
    pwd: "password"
},
`````
### Adding your own logo
Place your logo in: images/logo.png

If you want to change the name you'll need to modify line #1 in config.js
````
Find:background:url(logo.png)
Replace: logo.png for your filename
````

## Install dependencies
````sh
$ npm install
````

## Run

````bash
$ node index.js
````

## Use
Receipts will be served at the computer IP:3000, example:

http://localhost:3000 or
http://192.168.1.1:3000

#### Service people
URL/service
*Needs login data* Waitress / service people can access all available receipts at this address


##### Flow  
1. Check list of Receipts
2. Click on desired table to see the receipt
3. Optional: Click button to create a QR code for customers

#### Customers
URL/HASHCODE
A link that customers can use to access a table or ticket number, no password required, a hashid is generated to avoid users checking on other tables. This code can be made into barcodes or written in NFC tags. To check a list of codes use the /debug link (next section)

**Customers can download a PDF copy from here**

#### Development
URL/debug
Will display receipts available


## Collaborating
This project was created to be minimal, so I left all code together instead of separating it in modules, no Grunt, no SASS or LESS, no JS-hint or minimization, no i18n, no tests.

All those are possible welcome improvements, if the project is actually used I'll happily add them.
