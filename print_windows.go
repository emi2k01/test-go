package main

import (
	"io"

	"github.com/alexbrainman/printer"
)

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

func printers() ([]string, error) {
	return printer.ReadNames()
}

func defaultPrinter() (string, error) {
	return printer.Default()
}
