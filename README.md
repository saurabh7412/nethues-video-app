# Video Upload and Processing App

This is a Next.js application that utilizes the app routing feature to facilitate video uploads, process it for audio or transcript content, and allow users to interact with the processed content using AI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Deployment](#deployment)

## Features

1. **Video Upload**: Users can upload videos under 20 MB.
2. **Video Processing**: Once uploaded, videos are processed to generate summaries of any audio, transcript, captions, or messages found.
3. **Question-Answer Interface**: Users can ask questions about the video content.
4. **Responsive UI**: Built with Tailwind CSS for a clean and responsive design.
5. **Multi-platform Upload and Processing**: Utilizes both Firebase and Google Cloud Storage for optimized functionality.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, TypeScript
- **Backend & Services**: Firebase, Google Cloud Storage, GoogleGenerativeAI(Gemini Flash 1.5)


### Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone [https://github.com/your-repo-name.git](https://github.com/saurabh7412/nethues-video-app)
   cd nethues-video-app

2. **Getting Started**

  First, install modules:

  npm install
  
  Run the development server:

  npm run dev

  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Usage
1. Go to the render deployed link ( recommended ) and upload a video there.
2. Click process and wait for Gemini to analyse your video.
3. Ask questions about the video to Gemini and get the responses.

### Deployment
1. **Vercel**
  [Vercel Deployment](https://nethues-video-app.vercel.app/)
  App was successfully deployed on vercel but vercel has a request payload limit of 4.5 MB which drastically reduces the length of the uploadable video.
2. **Render**
   [Render Deployment](https://nethues-video-app.onrender.com/)
   As an alternative, the app was deployed on Render.
   Note: Render instance leads to rolling down of the web service so when visited it might take some time to wake up.

   

