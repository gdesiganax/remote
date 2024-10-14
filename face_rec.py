from flask import Flask, request, render_template, send_file
from gtts import gTTS
from io import BytesIO
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
    audio = BytesIO()
    tts.write_to_fp(audio)
    audio.seek(0)


    # Send the generated speech files
    return send_file(audio, mimetype='audio/mp3')


if __name__ == '__main__':
    app.run(debug=False)