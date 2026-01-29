import pymysql

# Fake the version to satisfy Django's requirement (mysqlclient >= 2.2.1)
# PyMySQL default mapping might be too old for Django 5/6
pymysql.version_info = (2, 2, 2, "final", 0)

pymysql.install_as_MySQLdb()
