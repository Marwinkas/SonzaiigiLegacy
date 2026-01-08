#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QHBoxLayout>
#include <QLabel>
#include <QPixmap>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QScrollArea>
#include <QSpacerItem>
#include <QUrl>


MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);


    QScrollArea *scrollArea = new QScrollArea(this);
    containerWidget = new QWidget(scrollArea);
    mainLayout = new QVBoxLayout(containerWidget);
    containerWidget->setLayout(mainLayout);
    scrollArea->setWidgetResizable(true);
    scrollArea->setWidget(containerWidget);
    setCentralWidget(scrollArea);

    connect(manager, &QNetworkAccessManager::finished,
            this, &MainWindow::onReplyFinished);

    // Initial request to fetch users
    QNetworkRequest request(QUrl("http://sonzaiigi.art/users"));
    manager->get(request);


}

MainWindow::~MainWindow()
{
    delete ui;
}


void MainWindow::onReplyFinished(QNetworkReply *reply)
{
    // Check which URL replied
    const QUrl requestedUrl = reply->url();

    if (requestedUrl.path().endsWith("/users")) {
        // Handling users JSON response
        if (reply->error() == QNetworkReply::NoError) {
            QByteArray responseData = reply->readAll();
            QJsonDocument jsonDoc = QJsonDocument::fromJson(responseData);
            if (jsonDoc.isArray()) {
                QJsonArray arr = jsonDoc.array();
                if (!arr.isEmpty()) {
                    for (const QJsonValue &value : arr) {
                        QJsonObject user = value.toObject();
                        int id = user["id"].toInt();
                        QString name = user["name"].toString();
                        QString email = user["email"].toString();
                        QString photoUrl = user["photo"].toString();

                        // Create widget for user
                        QWidget *userWidget = new QWidget(this);
                        QHBoxLayout *userLayout = new QHBoxLayout(userWidget);

                        // Photo placeholder
                        QLabel *photoLabel = new QLabel;
                        photoLabel->setFixedSize(64, 64);
                        photoLabel->setScaledContents(true);
                        photoLabel->setText("Loading...");
                        userLayout->addWidget(photoLabel);

                        // Info label
                        QLabel *infoLabel = new QLabel(
                            QString("ID: %1\nИмя: %2\nПочта: %3")
                                .arg(id)
                                .arg(name)
                                .arg(email)
                            );
                        userLayout->addWidget(infoLabel);

                        userWidget->setLayout(userLayout);
                        mainLayout->addWidget(userWidget);

                        // Request the photo
                        QUrl fullUrl(photoUrl);
                        if (fullUrl.isRelative()) {
                            fullUrl = QUrl("http://sonzaiigi.art").resolved(fullUrl);
                        }
                        QNetworkRequest imgRequest(fullUrl);
                        // Pass the photoLabel via the reply's "property"
                        QNetworkReply *imgReply = manager->get(imgRequest);
                        imgReply->setProperty("label", QVariant::fromValue<void*>(photoLabel));
                    }
                } else {
                    mainLayout->addWidget(new QLabel("Список пользователей пуст.", this));
                }
            } else {
                mainLayout->addWidget(new QLabel("Ошибка обработки JSON.", this));
            }
        } else {
            mainLayout->addWidget(
                new QLabel("Ошибка сети: " + reply->errorString(), this)
                );
        }
    } else {
        // Handling image reply
        if (reply->error() == QNetworkReply::NoError) {
            QByteArray data = reply->readAll();
            QPixmap pixmap;
            pixmap.loadFromData(data);
            QLabel *photoLabel = static_cast<QLabel*>(reply->property("label").value<void*>());
            if (photoLabel) {
                photoLabel->setPixmap(pixmap);
            }
        } else {
            QLabel *photoLabel = static_cast<QLabel*>(reply->property("label").value<void*>());
            if (photoLabel) {
                photoLabel->setText("Error loading image");
            }
        }
    }
    reply->deleteLater();
}
