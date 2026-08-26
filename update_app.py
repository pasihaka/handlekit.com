import re

with open('app.py', 'r') as f:
    content = f.read()

if 'import libsql_client' not in content:
    content = content.replace('import sqlite3', 'import sqlite3\nimport libsql_client')

new_get_db = '''class MockCursor:
    def __init__(self, rs):
        self.rs = rs
    def fetchall(self):
        class MockRow(dict): pass
        rows = []
        for r in self.rs.rows:
            rows.append(MockRow(zip(self.rs.columns, r)))
        return rows
    def fetchone(self):
        if not self.rs.rows: return None
        class MockRow(dict): pass
        return MockRow(zip(self.rs.columns, self.rs.rows[0]))

class MockDB:
    def __init__(self, client):
        self.client = client
    def execute(self, sql, parameters=()):
        if isinstance(parameters, dict):
            rs = self.client.execute(sql, parameters)
        else:
            rs = self.client.execute(sql, list(parameters))
        return MockCursor(rs)
    def commit(self):
        pass
    def close(self):
        self.client.close()

def get_db():
    import os
    url = os.environ.get("TURSO_DATABASE_URL")
    auth_token = os.environ.get("TURSO_AUTH_TOKEN")
    if url and auth_token:
        url = url.replace("libsql://", "https://")
        client = libsql_client.create_client_sync(url=url, auth_token=auth_token)
        return MockDB(client)
    else:
        db = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        return db'''

pattern = r'def get_db\(\):\s+db = sqlite3\.connect\(DATABASE\)\s+db\.row_factory = sqlite3\.Row\s+return db'
content = re.sub(pattern, new_get_db, content)

with open('app.py', 'w') as f:
    f.write(content)
print('Success')
