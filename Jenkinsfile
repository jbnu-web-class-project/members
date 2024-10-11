pipeline {
    agent {
        kubernetes {
            yaml """
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: docker
                image: docker:20.10.7
                command:
                - cat
                tty: true
                securityContext:
                  privileged: true
                volumeMounts:
                - name: docker-socket
                  mountPath: /var/run/docker.sock
              volumes:
              - name: docker-socket
                hostPath:
                  path: /var/run/docker.sock
            """
        }
    }

    environment {
        REGISTRY_CREDENTIALS = 'harbor-id'
        IMAGE_NAME = 'web-back'
        GITHUB_REPO = 'https://github.com/jbnu-web-class-project/backend.git'
        HARBOR_URL = credentials('harbor-url')
        HARBOR_REPO = credentials('harbor-repo')
        APP_SERVER_IP = credentials('ssh-ip')
        PORT = credentials('ssh-port')
        SSH_CREDENTIALS_ID = 'ssh-key'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: GITHUB_REPO, branch: 'main', credentialsId: 'web-service-pj-token'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // docker 컨테이너에서 docker build 실행
                    container('docker') {
                        sh "docker build -t heim/${IMAGE_NAME}:${env.BUILD_ID} ."
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                script {
                    container('docker') {
                        docker.withRegistry(HARBOR_URL, REGISTRY_CREDENTIALS) {
                            def app = docker.image("heim/${IMAGE_NAME}:${env.BUILD_ID}")
                            app.push()
                            app.push('latest')
                        }
                    }
                }
            }
        }

        stage('Deploy to Application Server') {
            steps {
                script {
                    // SSH 키를 사용하여 서버에 연결
                    sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                        withCredentials([usernamePassword(credentialsId: 'harbor-id', passwordVariable: 'HARBOR_PASSWORD', usernameVariable: 'HARBOR_USERNAME')]) {
                            sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER_IP} -p ${PORT} '
                                echo "${HARBOR_PASSWORD}" | sudo docker login ${HARBOR_URL} -u ${HARBOR_USERNAME} --password-stdin &&
                                sudo docker pull ${HARBOR_REPO}/heim/${IMAGE_NAME}:latest &&
                                sudo docker stop web-back || true &&
                                sudo docker rm web-back || true &&
                                sudo docker run -d --name web-back -p 3000:3000 ${HARBOR_REPO}/heim/${IMAGE_NAME}:latest
                            '
                            """
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
