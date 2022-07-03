package main

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/alexbrainman/printer"
	"github.com/emersion/go-autostart"
	"github.com/getlantern/systray"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pkg/browser"
	"github.com/sirupsen/logrus"
)

const Address = "localhost:4455"

func main() {
	exePath, _ := os.Executable()

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

	r := gin.Default()
	selectedPrinter := ""

	r.Use(cors.Default())

	r.GET("/printers", func(ctx *gin.Context) {
		names, err := printer.ReadNames()
		if err != nil {
			logrus.WithError(err).Error("failed to get printers")
			ctx.JSON(http.StatusInternalServerError, gin.H{})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"printers": names,
		})
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
			defaultPrinter, err := printer.Default()
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

	r.Run(Address)
}

func print(printerName string, bodyStream io.ReadCloser) error {
	defer bodyStream.Close()
	body, err := io.ReadAll(bodyStream)
	if err != nil {
		return err
	}

	printerDevice, err := printer.Open(printerName)
	if err != nil {
		return err
	}

	if err = printerDevice.StartRawDocument("ticket"); err != nil {
		return err
	}

	if err = printerDevice.StartPage(); err != nil {
		return err
	}

	_, err = printerDevice.Write(body)
	if err != nil {
		return err
	}

	if err = printerDevice.EndPage(); err != nil {
		return err
	}

	if err = printerDevice.EndDocument(); err != nil {
		return err
	}

	if err = printerDevice.Close(); err != nil {
		return err
	}
	return nil
}
