from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Create database and tables
def init_db():
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password TEXT)''')
    
    # Transactions table
    c.execute('''CREATE TABLE IF NOT EXISTS transactions
                 (id INTEGER PRIMARY KEY,
                  username TEXT,
                  description TEXT,
                  amount REAL,
                  type TEXT,
                  category TEXT,
                  date TEXT)''')
    
    conn.commit()
    conn.close()

# Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    try:
        c.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                  (username, password))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except:
        conn.close()
        return jsonify({'success': False, 'message': 'Username already exists!'})

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username=? AND password=?',
              (username, password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({'success': True, 'username': username})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password!'})

# Get transactions for a user
@app.route('/transactions', methods=['GET'])
def get_transactions():
    username = request.args.get('username')
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute('SELECT * FROM transactions WHERE username=?', (username,))
    rows = c.fetchall()
    conn.close()
    
    transactions = []
    for row in rows:
        transactions.append({
            'id': row[0],
            'username': row[1],
            'description': row[2],
            'amount': row[3],
            'type': row[4],
            'category': row[5],
            'date': row[6]
        })
    return jsonify(transactions)

# Add transaction
@app.route('/add', methods=['POST'])
def add_transaction():
    data = request.get_json()
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute('INSERT INTO transactions (id, username, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
              (data['id'], data['username'], data['description'],
               data['amount'], data['type'], data['category'], data['date']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Transaction added!'})

# Delete transaction
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute('DELETE FROM transactions WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Deleted!'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)