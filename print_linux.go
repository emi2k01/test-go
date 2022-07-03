package main

import "io"

func print(printerName string, bodyStream io.ReadCloser) error {
	return nil
}

func printers() ([]string, error) {
	return []string{"Printer one", "Printer two"}, nil
}

func defaultPrinter() (string, error) {
	return "Printer one", nil
}
