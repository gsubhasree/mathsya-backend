import os
import numpy as np
from flask import Flask,flash, request, render_template, redirect
import matplotlib.pyplot as plt
import pandas as pd
from os import path
from werkzeug.utils import secure_filename
import json
 
import pickle
 
app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv','xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
filelist = os.listdir(app.config['UPLOAD_FOLDER'])
subs='-data'
db_choices=[name.rsplit('-data.', 1)[0] for name in filelist if subs in name]
current_choice = 0

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
 
@app.route('/')
def home():  
    if str(path.exists("uploads//"+db_choices[current_choice]+"-data.pkl")) == "False":
        df = pd.read_csv('fishdata.csv')
        df.to_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    else:
        df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    rows=len(df)
    col=len(df.columns)
    return render_template('index.html',info="Dataset has {r} rows, {c} columns".format(r=rows,c=col), db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )

@app.route('/view',methods=['POST'])
def view():
    if request.method == 'POST':
        df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
        return render_template('view.html',df_view=df.to_html())
 
@app.route('/add',methods=['POST'])
def add():
    if request.method == 'POST':
        row=request.form['noc']
        df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
        y = df.iloc[:,-1].values
        return render_template('add.html',rows=int(row), options = df.columns[0:-1], types = list(set(y)), type = df.columns[-1])
    
@app.route('/append',methods=['POST'])
def append():
    rows=None
    col=None
    df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    if request.method == 'POST':
        for x in range(len(request.form.getlist(df.columns[0]+'[]'))):
            sample_data = {}
            for y in df.columns:
                sample_data[y] = request.form.getlist(y+'[]')[x]
            df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
            df = df.append(sample_data,ignore_index=True)
            df.to_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
        rows=len(df)
        col=len(df.columns)
    return render_template('index.html',info="Dataset has {r} rows, {c} columns".format(r=rows,c=col),response="Data Successfully added to table", db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
    
@app.route('/train',methods=['POST'])
def train():
    df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    rows=len(df)
    cols=len(df.columns)
    model_choice = request.form['model_choice']
    x = df.iloc[:,:-1].values
    y = df.iloc[:,-1].values
    try:
        if model_choice == 'decisiontree':
            from sklearn import tree
            classifier=tree.DecisionTreeClassifier()
            classifier.fit(x,y)
            pickle.dump(classifier, open("uploads//"+db_choices[current_choice]+"-dtree.pkl",'wb'))
            with open("uploads//"+db_choices[current_choice]+"-dtree.pkl", 'rb') as f:
                data = pickle.load(f)
            fig = plt.figure(figsize=(25,20))
            tree.plot_tree(classifier, feature_names=df.columns[0:-1]  ,class_names=list(set(y)) ,filled=True)
            treeimg="static/images//"+db_choices[current_choice]+"-treeimg.jpg"
            fig.savefig(treeimg)
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="Decisiontree model trained and stored in localstorage",data=data,model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1],img=treeimg )
        
        elif model_choice == 'KNN':
            from sklearn import neighbors
            classifier=neighbors.KNeighborsClassifier()
            classifier.fit(x,y)
            pickle.dump(classifier, open("uploads//"+db_choices[current_choice]+"-knn.pkl",'wb'))
            with open("uploads//"+db_choices[current_choice]+"-knn.pkl", 'rb') as f:
                data = pickle.load(f)
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="K-NN model trained and stored in localstorage",data=data,model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        
        elif model_choice == 'SVM':
            from sklearn import svm
            classifier= svm.SVC(gamma='scale')
            classifier.fit(x,y)
            pickle.dump(classifier, open("uploads//"+db_choices[current_choice]+"-svm.pkl",'wb'))
            with open("uploads//"+db_choices[current_choice]+"-svm.pkl", 'rb') as f:
                data = pickle.load(f)
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="SVM model trained and stored in localstorage",data=data,model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        
        elif model_choice == 'LogisticRegression':
            from sklearn.linear_model import LogisticRegression
            classifier = LogisticRegression(multi_class='auto',solver='lbfgs')
            classifier.fit(x, y)
            pickle.dump(classifier, open("uploads//"+db_choices[current_choice]+"-lr.pkl",'wb'))
            with open("uploads//"+db_choices[current_choice]+"-lr.pkl", 'rb') as f:
                data = pickle.load(f)
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="Logistic Regression model trained and stored in localstorage",data=data,model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        
        elif model_choice == 'RandomForest':
            from sklearn.ensemble import RandomForestClassifier
            classifier = RandomForestClassifier()
            classifier.fit(x,y)
            pickle.dump(classifier, open("uploads//"+db_choices[current_choice]+"-rf.pkl",'wb'))
            with open("uploads//"+db_choices[current_choice]+"-rf.pkl", 'rb') as f:
                data = pickle.load(f)
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="Random Forest model trained and stored in localstorage",data=data,model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        
    except Exception as e:
        print(e)
        return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),response="Training Unsuccessful, inappropriate CSV data",model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1],img="null" )

@app.route('/predict',methods=['POST'])
def predict():
    df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    rows=len(df)
    cols=len(df.columns)
    model_choice = request.form['model_choice']
    features = []
    treeimg=""
    for x in df.columns[0:-1]:
        features.append(request.form[x])
    final_features = [np.array(features)]

    if model_choice == 'decisiontree':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-dtree.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train decision tree model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-dtree.pkl", 'rb'))
        treeimg="static/images//"+db_choices[current_choice]+"-treeimg.jpg"
        
    elif model_choice == 'KNN':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-knn.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train knn model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-knn.pkl", 'rb'))

    elif model_choice == 'SVM':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-svm.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train SVM model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-svm.pkl", 'rb'))

    elif model_choice == 'LogisticRegression':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-lr.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train Logistic Regression model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-lr.pkl", 'rb'))  
        final_features = [np.array(features).astype(float)]

    elif model_choice == 'RandomForest':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-rf.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train Random Forest model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-rf.pkl", 'rb'))  

    prediction = model.predict(final_features)
 
    return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols), features='Given {} :{}'.format(list(df.columns[0:-1]),features),prediction_text='{}'.format(prediction),response="Prediction ({}) Successful".format(model_choice),model_choice=model_choice, db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1],img=treeimg )

@app.route('/predictjson',methods=['POST'])
def predictjson():
    df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
    rows=len(df)
    cols=len(df.columns)
    data = json.loads(request.data)
    print(data, type(data))
    model_choice = data['model_choise']
    print(model_choice)
    features = []
    treeimg=""
    for x in df.columns[0:-1]:
        features.append(data[x.lower()])
    print(features)
    final_features = [np.array(features)]

    if model_choice == 'decisiontree':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-dtree.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train decision tree model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-dtree.pkl", 'rb'))
        treeimg="static/images//"+db_choices[current_choice]+"-treeimg.jpg"
        
    elif model_choice == 'KNN':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-knn.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train knn model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-knn.pkl", 'rb'))

    elif model_choice == 'SVM':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-svm.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train SVM model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-svm.pkl", 'rb'))

    elif model_choice == 'LogisticRegression':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-lr.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train Logistic Regression model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-lr.pkl", 'rb'))  
        final_features = [np.array(features).astype(float)]

    elif model_choice == 'RandomForest':
        if str(path.exists("uploads//"+db_choices[current_choice]+"-rf.pkl")) == "False":
            return render_template('index.html',info="Dataset has {} rows, {} columns".format(rows,cols),prediction_text='Please train Random Forest model before testing', db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] )
        model = pickle.load(open("uploads//"+db_choices[current_choice]+"-rf.pkl", 'rb'))  

    prediction = model.predict(final_features)
 
    return { "prediction" : str(prediction) }
             
@app.route('/dbchange',methods=['POST'])
def dbchange():
    if request.method == 'POST':
        db_choice=request.form['db_choice']
        global current_choice
        current_choice = db_choices.index(db_choice)
        df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
        rows=len(df)
        col=len(df.columns)
        return render_template('index.html',info="Dataset has {r} rows, {c} columns".format(r=rows,c=col), db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] ,response="Database Changed to {} Successful".format(db_choices[current_choice].upper()))

@app.route('/upload', methods = ['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            df = pd.read_csv(file)
            name=filename.rsplit('.', 1)[0]
            if name not in db_choices:
                db_choices.append(name)
                global current_choice
                current_choice = db_choices.index(name)
                df.to_pickle('uploads//'+name+'-data.pkl')
                rows=len(df)
                col=len(df.columns)
                return render_template('index.html',info="Dataset has {r} rows, {c} columns".format(r=rows,c=col), db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] ,response="Database {} Upload Successful".format(name.upper()))
            else:
                df = pd.read_pickle("uploads//"+db_choices[current_choice]+"-data.pkl")
                rows=len(df)
                col=len(df.columns)
                return render_template('index.html',info="Dataset has {r} rows, {c} columns".format(r=rows,c=col), db_choices = db_choices, current_choice = db_choices[current_choice], options = df.columns[0:-1] ,response="Database {} already exists".format(name.upper()))

if __name__ == "__main__":
    app.run(debug=True)
    
