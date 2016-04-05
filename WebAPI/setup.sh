# Install dependencies on Ubuntu

curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y git
sudo apt-get install -y mysql-server

git clone https://github.com/BloomsdayRun/BloomsdayApp-Server.git
# edit InitializeDB.sql: (replace USERNAME/PASSWORD with actual values)
# pico config/constants.js (set USERNAME/PASSWORD)
# mysql -u root -p
# 	source InitializeDB.sql 

# in BloomsdayRun/WebAPI
npm install
sudo npm install -g forever

# Fix nofile limits
# sudo pico /etc/security/limits.conf
# * soft nofile 100000 
# * hard nofile 100000
# Check with ulimit -Hn, ulimit -Sn

sudo reboot

# forever start AWSServer.js
