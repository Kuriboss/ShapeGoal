import pymongo, cgi
from random import randint
form = cgi.FieldStorage()

client = MongoClient('localhost', 27017, username='username', password='password')

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["users"]
func =  form.getvalue('func')

def login():
	email =  form.getvalue('email')
	passx =  form.getvalue('password')
	for x in mycol.find({},{ "username": email, "password": passx }):
	  print(x)
	return render_template('base.html', data=x )
 #rough code on login and account creation.
def account():
	namex =  form.getvalue('first_name')
	namey =  form.getvalue('last_name')
	dob =  form.getvalue('birthday')
	email =  form.getvalue('email')
	phone =  form.getvalue('phone')
	goal =  form.getvalue('goal')
	image =  form.getvalue('image')
	code=randint(100000,999999)
	f = request.files['image']
	passx =  form.getvalue('password')
	filename = secure_filename(f.filename)
	# .. might not work in path
	f.save(os.path.join(app.config['../img/userimg'], filename))
	mydict = { "name": namex+" "+namey, "dob":dob,"email":email,"goal":goal,"image":image,"phone":phone,"password":passx,"code":code }
	x = mycol.insert_one(mydict)
	return render_template('base.html', form=form )


if func=='log':
	login()
elif func=='sign':
	account()
