from flask import Flask, request, render_template, send_file
from gtts import gTTS
import os

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/speak', methods=['POST'])
def speak():
    text = request.form['text']
    language = 'en'

    # Convert text to speech
    tts = gTTS(text=text, lang=language)
    tts.save('static/speech.mp3')

    # Send the generated speech files
    return send_file('static/speech.mp3', as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)