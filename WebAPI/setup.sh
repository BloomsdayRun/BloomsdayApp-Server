# Install dependencies on Ubuntu

curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y git
sudo apt-get install -y mysql-server

# edit InitializeDB.sql: (replace USERNAME/PASSWORD with actual values)
# mysql -u root -p
# 	source InitializeDB.sql 
