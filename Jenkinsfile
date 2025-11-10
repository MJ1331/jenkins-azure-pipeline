pipeline {
  agent any

  environment {
    ACR_LOGIN = "jenkinsacr42691.azurecr.io"
    IMAGE_NAME = "${env.ACR_LOGIN}/sample-app"
    WEBAPP_RG = "jenkins-rg"
    WEBAPP_NAME = "jenkinswebapp42691"
    AZ_SUBSCRIPTION = "4fb21ee6-56d0-4796-9647-6d17dc72cf81"
    TENANT_ID = "5beb351c-3fb8-418f-b612-fe36ace96ef3"
  }

  stages {
    stage('Checkout') {
      steps {
        git url: 'git@github.com:YOUR_GITHUB_USERNAME/jenkins-azure-pipeline.git', branch: 'main'
      }
    }

    stage('Build & Test') {
      steps {
        sh 'npm install'
        sh 'npm test'
      }
    }

    stage('Docker Build') {
      steps {
        script {
          env.IMAGE_TAG = "${env.BUILD_NUMBER}"
        }
        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
      }
    }

    stage('Push to ACR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'acr-sp-credentials', usernameVariable: 'AZ_APPID', passwordVariable: 'AZ_PASSWORD')]) {
          sh '''
            echo "$AZ_PASSWORD" | docker login ${ACR_LOGIN} -u $AZ_APPID --password-stdin
            docker push ${IMAGE_NAME}:${IMAGE_TAG}
          '''
        }
      }
    }

    stage('Deploy to Azure Web App') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'acr-sp-credentials', usernameVariable: 'AZ_APPID', passwordVariable: 'AZ_PASSWORD')]) {
          sh '''
            az login --service-principal -u $AZ_APPID -p $AZ_PASSWORD --tenant ${TENANT_ID}
            az account set --subscription ${AZ_SUBSCRIPTION}
            az webapp config container set -g ${WEBAPP_RG} -n ${WEBAPP_NAME} \
              --docker-custom-image-name ${IMAGE_NAME}:${IMAGE_TAG} \
              --docker-registry-server-url https://${ACR_LOGIN}
            az webapp restart -g ${WEBAPP_RG} -n ${WEBAPP_NAME}
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline completed successfully!"
    }
    failure {
      echo "❌ Pipeline failed. Check logs for details."
    }
  }
}
