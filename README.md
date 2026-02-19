# Personal Contanct Manager 

## Description  
A Personal Contact Manager web application that lets clients create and have full control of their own private contact lists.

## Features
* **User Registration** - Users can create an account with an username, email, and password 

* **User Login** - Login with username and password 

* **Add Contacts** - Add new contacts with required field of first name  

* **Search Contacts** - Search contacts by first or last name

* **Edit Contacts** - Edit any information field from contacts 

* **Delete Contacts** - Delete contacts from contact list

## Technology Used  
* **Linux**
* **Apache**
* **MySQL**
* **HTML, CSS, and JS**
* **PHP**
* **Visual Studio Code**
* **FileZilla**
* **SwaggerHub**
* **GitHub**
* **Discord**

## Setup Instructions
A **LAMP stack server** (Linux, Apache, MySQL, and PHP) is required to build and run the personal contact manager web application.

### 1) Add Repository to Local Machine
Access your command terminal and clone the github repository to a new or empty directory

```
git clone https://github.com/jarielys-cg/cop4331-small-project-20.git <new-folder-name>
```

Access and view HTML, CSS, JS, and API files:

```
cd html
cd css
cd js
cd api
```

**Note:** A database schema has been provided that defines how to create database tables after database creation.  

To view database schema in local repository: 
```
cd db
```

### 2) Create MySQL Database
Connect to LAMP server
```
ssh root@DomainORIPAddress
```

Connect to MySQL:
```
mysql -u root -p
```

Create and access database:
```
create database <database-name>;
use <database-name>;
```

Create database tables with the provided database schema.

Create a user to grant permissions to the database.
```
use <database-name>;
create user '<database-username>' identified by '<database-password>';
grant all privileges on <database-name>.* to '<database-username>'@'%';
```

**Note:** In each PHP file, located in the api folder, remove lines:
```
$ENV = parse_ini_file(__DIR__ . '/../.env');
$conn = new mysqli($ENV['DB_HOST'], $ENV['DB_USER'], $ENV['DB_PASS'], $ENV['DB_NAME']);
```
And add line:
```
$conn = new mysqli("localhost", "<database-username>", "<database-password>", "<database-name>");
```

### 3) Transfer Web Application Files to LAMP Server
To navigate to the web root's directory in a LAMP server:
```
cd /var/www/html
```

Create directories for CSS, JS, and PHP files:
```
mkdir css
mkdir js
mkdir api
```

**Note:** For a direct method for transfering files, use a SFTP like **FileZilla**.  

## Application Access
To access and test the web application, open a broswer and type the domain name or IP address.
```
http://cop4331cs.xyz
```
## AI Assistance

* **Tool**: ChatGPT 5.2 (chatgpt.com)
* **Dates**: February 18-19, 2026
* **Scope**: Implementation of error checking on login and signup and informing the user
* **Use**: Generated duplicate username handling for signup API and additions to validation of login and signup forms JavaScript code(modified).

All AI-generated code was reviewed, tested, and modified to meet
assignment requirements. Final implementation reflects my understanding
of the concepts.