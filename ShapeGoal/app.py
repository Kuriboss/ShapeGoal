from flask import Flask, render_template, url_for, redirect, session
import requests
from flask_cors import CORS
from pymongo import MongoClient
from flask import make_response, send_from_directory


app = Flask(__name__)
CORS(app)
app.config["SESSION_PERMANENT"] = False
client = MongoClient('localhost', 27017, username='username', password='password')

db = client.flask_db
todos = db.todos
user=[]

# ...

# Ajout
# @app.route('/', methods=('GET', 'POST'))
# def index():
#     if request.method=='POST':
#         content = request.form['content']
#         degree = request.form['degree']
#         todos.insert_one({'content': content, 'degree': degree})
#         return redirect(url_for('index'))
#
#     all_todos = todos.find()
#     return render_template('index.html', todos=all_todos)

#functions routes



#Redirect Routes
@app.route('/')
def index():
    return render_template('base.html', userinfo=user)
@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/calcul')
def calcul():
    return render_template('calculator.html')

@app.route('/watch')
def watch():
    return render_template('watcher.html')
@app.route('/sw.js')
@app.route('/login')
#def login():
#     return redirect('http://localhost:3000/admin')
def sw():
    return redirect('http://localhost:3000/login', request.form)
@app.route('/logout')

def logout():

    print(session)
    return redirect('http://127.0.0.1:5000/')



@app.route('/events.js')
def event():
    response=make_response(
                     send_from_directory(directory='static',path='js/events.js'))
    #change the content header file. Can also omit; flask will handle correctly.
    response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route('/main.js')
def mainx():
    response=make_response(
                     send_from_directory(directory='static',path='js/main.js'))
    #change the content header file. Can also omit; flask will handle correctly.
    response.headers['Content-Type'] = 'application/javascript'
    return response
@app.route('/texts.js')
def texts():
    response=make_response(
                     send_from_directory(directory='static',path='js/texts.js'))
    #change the content header file. Can also omit; flask will handle correctly.
    response.headers['Content-Type'] = 'application/javascript'
    return response
@app.route('/SignUp')
def i():
    return render_template('SignUp.html')
if __name__ == "__main__":
    app.run(debug=True)
@app.route('/register')
def register():
 #   echo=request.form['signx']
    return redirect('http://localhost:3000/register',data=request.form)
@app.route('/session/<user>')
def session():
 #   echo=request.form['signx']
    session['user']= user
    session['logged_in']= True
    return response
@app.route('/session')
def sessionx():
 #   echo=request.form['signx']
    if("logged_in" in session):
        session['user']="asdasdasd"
    return user