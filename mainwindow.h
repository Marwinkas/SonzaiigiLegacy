#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QVBoxLayout>
#include <QWidget>
#include <QLabel>
QT_BEGIN_NAMESPACE
namespace Ui {
class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
private slots:
    void onReplyFinished(QNetworkReply *reply);
private:
    Ui::MainWindow *ui;
    QNetworkAccessManager *manager;
    QWidget *containerWidget;
    QVBoxLayout *mainLayout;
};
#endif // MAINWINDOW_H
