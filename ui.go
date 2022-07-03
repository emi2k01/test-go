package main

import "embed"

//go:embed dashboard/dist/*
var ui embed.FS
