#include "mainwindow.h"
#include <QApplication>
#include <QFile> // Required for QFile
#include <QTextStream> // Required for QTextStream

int main(int argc, char *argv[]) {
    QApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);
    QApplication a(argc, argv);

    // Load and apply the stylesheet from resources
    QFile styleSheetFile(":/dark_theme.qss");
    if (styleSheetFile.open(QFile::ReadOnly | QFile::Text)) {
        QTextStream ts(&styleSheetFile);
        QString styleSheet = ts.readAll();
        a.setStyleSheet(styleSheet);
    }
    
    std::string path = "";
    int init_mode = 0;
    if(argc > 1){
        path = argv[1];
        if(argc > 2)
            init_mode = argv[2][0] - '0';
    }
    MainWindow w(0, path, init_mode);
    w.show();

    return a.exec();
}
