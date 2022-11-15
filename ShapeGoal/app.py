from flask import Flask, render_template, url_for




from pymongo import MongoClient






app = Flask(__name__)


client = MongoClient('localhost', 27017, username='username', password='password')

db = client.flask_db
todos = db.todos


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
    return render_template('base.html')
@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/SignUp')
def i():
    return render_template('SignUp.html')
if __name__ == "__main__":
    app.run(debug=True)

