from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import face_recognition
import cv2
import pickle
import secrets

app = Flask(__name__)
with app.app_context():
    app.secret_key = secrets.token_hex(16)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
    db = SQLAlchemy(app)


# User model for SQLAlchemy
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)
    face_encoding = db.Column(db.PickleType, nullable=False)


# Route for home page (Restricted)
@app.route('/')
def home():
    if "user_id" in session:
        return render_template('home.html', username=session['username'])
    else:
        flash("Please log in to access the home page.")
        return redirect(url_for('login'))


# Route for user registration
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='sha256')

        # Capture face from camera
        video_capture = cv2.VideoCapture(0)
        ret, frame = video_capture.read()
        video_capture.release()

        if not ret:
            flash("Error capturing image. Try again.")
            return redirect(url_for('register'))

        face_locations = face_recognition.face_locations(frame)
        if len(face_locations) == 0:
            flash("No face detected, please try again.")
            return redirect(url_for('register'))

        face_encoding = face_recognition.face_encodings(frame, face_locations)[0]

        # Save user with face encoding
        new_user = User(username=username, password=hashed_password, face_encoding=pickle.dumps(face_encoding))
        db.session.add(new_user)
        db.session.commit()

        flash("Registration successful. Please log in.")
        return redirect(url_for('login'))

    return render_template('register.html')


# Route for login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username

            # Verify face
            video_capture = cv2.VideoCapture(0)
            ret, frame = video_capture.read()
            video_capture.release()

            if not ret:
                flash("Error capturing image. Try again.")
                return redirect(url_for('login'))

            face_locations = face_recognition.face_locations(frame)
            if len(face_locations) == 0:
                flash("No face detected, please try again.")
                return redirect(url_for('login'))

            face_encoding = face_recognition.face_encodings(frame, face_locations)[0]
            matches = face_recognition.compare_faces([pickle.loads(user.face_encoding)], face_encoding)

            if matches[0]:
                flash("Login successful.")
                return redirect(url_for('home'))
            else:
                flash("Face not recognized. Try again.")
                return redirect(url_for('login'))
        else:
            flash("Invalid username or password.")
            return redirect(url_for('login'))

    return render_template('login.html')


# Route for logout
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash("You have been logged out.")
    return redirect(url_for('login'))


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)