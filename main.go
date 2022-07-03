package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"runtime/debug"
	"time"

	"github.com/emersion/go-autostart"
	"github.com/getlantern/systray"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/browser"
	"github.com/sanbornm/go-selfupdate/selfupdate"
	"github.com/sirupsen/logrus"
)

const Address = "localhost:4455"

var exePath string
var version string

func main() {
	exePath, _ = os.Executable()
	buildInfo, _ := debug.ReadBuildInfo()
	version = buildInfo.Main.Version

	appLaunch := &autostart.App{
		Name:        "com.codasai.gt-local-server-dashboard",
		DisplayName: "GT Local Server Dashboard",
		Exec:        []string{exePath},
	}

	if !appLaunch.IsEnabled() {
		if err := appLaunch.Enable(); err != nil {
			logrus.WithError(err).Error("failed to activate autolaunch")
		}
	}

	go runServer()
	runSystray()

}

func runServer() {
	r := gin.Default()
	selectedPrinter := ""

	r.Use(cors.Default())

	r.Use(static.Serve("/", EmbeddedFolder(ui, "dashboard/dist")))

	r.GET("/printers", func(ctx *gin.Context) {
		names, err := printers()
		if err != nil {
			logrus.WithError(err).Error("failed to get printers")
			ctx.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		ctx.JSON(http.StatusOK, names)
	})

	r.POST("/printer", func(ctx *gin.Context) {
		var printer *string

		if err := ctx.BindJSON(&printer); err != nil {
			logrus.WithError(err).Error("failed to bind json")
			ctx.JSON(http.StatusBadRequest, gin.H{})
			return
		}

		selectedPrinter = *printer
	})

	r.GET("/printer", func(ctx *gin.Context) {
		fmt.Println(selectedPrinter)
		ctx.JSON(http.StatusOK, selectedPrinter)
	})

	r.POST("/print", func(ctx *gin.Context) {
		printerToBeUsed := selectedPrinter
		if len(printerToBeUsed) == 0 {
			defaultPrinter, err := defaultPrinter()
			if err != nil {
				logrus.WithError(err).Error("failed to get default printer")
				ctx.JSON(http.StatusInternalServerError, gin.H{})
				return
			}
			printerToBeUsed = defaultPrinter
		}

		err := print(printerToBeUsed, ctx.Request.Body)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, nil)
		}

	})

	r.GET("/update", func(ctx *gin.Context) {
		newUpdate, err := checkUpdate()
		if err != nil {
			logrus.Errorf("%s", err)
			ctx.JSON(http.StatusInternalServerError, false)
			return
		}
		ctx.JSON(http.StatusOK, newUpdate)
	})

	r.POST("/update", func(ctx *gin.Context) {
		if err := selfUpdate(); err != nil {
			logrus.WithError(err).Error("failed to self update")
			ctx.JSON(http.StatusInternalServerError, nil)
			return
		}
		ctx.JSON(http.StatusOK, nil)
	})

	for _, arg := range os.Args {
		if arg == "--delay" {
			time.Sleep(1 * time.Second)
		}
	}
	r.Run(Address)
}

func runSystray() {
	systray.Run(func() {
		systray.SetIcon(icon)
		systray.SetTitle("GT Local Server Dashboard")
		systray.SetTooltip("Configure settings for local devices and more...")

		openDashboardItem := systray.AddMenuItem("Dashboard", "Open dashboard in your browser")
		go func() {
			for {
				select {
				case <-openDashboardItem.ClickedCh:
					browser.OpenURL(Address)
				}
			}
		}()
	}, func() {})
}

func newUpdater() selfupdate.Updater {
	return selfupdate.Updater{
		CurrentVersion: version,
		ApiURL:         "https://goldtree-assets.s3.amazonaws.com/releases/",
		BinURL:         "https://goldtree-assets.s3.amazonaws.com/releases/",
		DiffURL:        "https://goldtree-assets.s3.amazonaws.com/releases/",
		Dir:            "update",
		CmdName:        "gt-local-dashboard",
		ForceCheck:     true,
	}
}

func checkUpdate() (bool, error) {
	updater := newUpdater()
	latestVersion, err := updater.UpdateAvailable()

	if err != nil {
		return false, fmt.Errorf("failed to check for updates: %w", err)
	}

	if latestVersion != version {
		return true, nil
	}

	return false, nil
}

func selfUpdate() error {
	updater := newUpdater()
	if err := updater.Update(); err != nil {
		return err
	}
	go func() {
		time.Sleep(1 * time.Second)
		exec.Command(exePath, "--delay")
		os.Exit(0)
	}()
	return nil
}
