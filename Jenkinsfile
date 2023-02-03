pipeline {
    agent any
    tools {
        dockerTool 'DockerTest' 
    }
    stages {
        stage('Prepare') {
            steps {
                // Get some code from a GitHub repository
                git branch: 'main', url: 'https://github.com/AnnaKlueva/LighthouseExample.git'
            }
        }
        stage('Create image') {
            steps {
                // Create image from Docker file
                sh """docker build . -t annak/node-chrome"""
            }
        }
        stage('Test') {
            steps {
                sh """docker run --rm -v "${env.WORKSPACE}":${env.WORKSPACE} -w "${env.WORKSPACE}" annak/node-chrome:latest /bin/bash -c 'npm ci && node index.js'"""
                //npm ci && node index.js
            }
        }
    }
}
