# ML Classifier
	
https://classifier-ml.herokuapp.com/ 
	
https://prediction-on-iris-dataset.herokuapp.com/ (basic version: for iris dataset)

## Requirements:
	Python(version 3.7) IDE (Anaconda recommended)
	FLASK 
	Gunicorn
	Libraries: numpy, pandas, os, seaborn, scikit-learn, matplotlib, pickle

## Installation & Setup:
	After installing packages in requirements and setting up virtual env,
	run this command in the directory containing code:
		python app.py
	After executing the command above, visit http://localhost:5000/ in your browser to see your app

## Description:
	To train and deploy ML classification algorithms on Dataset uploaded by user. 
	Algorithms used here are:
	Logistic Regression,Decision Tree, KNN, SVM & Random Forest Classifier.

	The deployed website has the following provisions:
		•Upload datasets
		•Select current dataset and:
		->Add new data over the current dataset: 
			User can add input data over the current datset.
		->Train the current dataset on model of user's choice(from the 5) and retain the model
		->Test the current model: 
			The species is predicted by the trained model of user's choice.
		->View the dataset

## Acknowledgements:
### Installation:
Anaconda: https://docs.anaconda.com/anaconda/install/

### Resources:
ML scikit-learn classification models:
https://stackabuse.com/overview-of-classification-methods-in-python-with-scikit-learn/

Integrating ML models with flask: 
https://www.analyticsvidhya.com/blog/2020/09/integrating-machine-learning-into-web-applications-with-flask/

### Deploy to heroku:
https://hidenobu-tokuda.com/how-to-build-a-hello-world-web-application-using-flask-and-deploy-it-to-heroku/
https://stackabuse.com/deploying-a-flask-application-to-heroku/
	
	
	
		

