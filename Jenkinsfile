pipeline {
  agent any

  environment {
    ACR_NAME = "jenkinsacr42691"
    ACR_URL  = "${env.ACR_NAME}.azurecr.io"
    IMAGE    = "${env.ACR_URL}/sample-app:latest"
    WORKDIR  = "/tmp/jenkins-build"
  }

  stages {
    stage('Checkout') {
      steps {
        sh 'rm -rf $WORKDIR && git clone --depth 1 git@github.com:MJ1331/jenkins-azure-pipeline.git $WORKDIR'
      }
    }

    stage('Build & Test') {
      steps {
        dir("$WORKDIR") {
          sh '''
            set -e
            npm install
            npm test || true
          '''
        }
      }
    }

    stage('Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'acr-creds', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
          dir("$WORKDIR") {
            sh '''
              set -e
              docker build -t $IMAGE .
              echo $ACR_PASS | docker login $ACR_URL -u $ACR_USER --password-stdin
              docker push $IMAGE
              # do not logout here if you'll pull/run on the same agent afterwards
            '''
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        // This assumes the deploy stage runs on a node that can run docker commands
        withCredentials([usernamePassword(credentialsId: 'acr-creds', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
          sh '''
            set -e
            echo "Deploy: authenticating to ACR"
            echo $ACR_PASS | docker login $ACR_URL -u $ACR_USER --password-stdin

            # remove old container if exists (ignore failure)
            docker rm -f sample-app || true

            # pull the pushed image (now we're logged in)
            docker pull $IMAGE

            # run the container (adjust ports/env as required)
            docker run -d --name sample-app -p 80:3000 $IMAGE

            docker logout $ACR_URL
          '''
        }
      }
    }
  }

  post {
    success { echo "✅ Build & deploy completed." }
    failure { echo "❌ Build or deploy failed; check logs." }
  }
}
