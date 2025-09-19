pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm ci || npm install' }
    }
    stage('Lint') {
      steps { sh 'npm run lint' }
    }
    stage('Test') {
      steps { sh 'npm test -- --ci' }
    }
    stage('Build Web') {
      steps { sh 'npm run build:web' }
    }
    stage('Docker Build') {
      steps { sh 'docker build -t localmenu-b2b:latest .' }
    }
  }
}
