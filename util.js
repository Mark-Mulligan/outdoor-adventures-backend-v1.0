const rebuildDatabase = `DROP TABLE IF EXISTS parks; CREATE TABLE parks (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(255), parkcode VARCHAR(10), states VARCHAR(255), designation VARCHAR(255));`;

module.exports = rebuildDatabase;
