package main

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/gin-contrib/static"
)

type embeddedFileSystem struct {
	http.FileSystem
}

func (e embeddedFileSystem) Exists(prefix string, path string) bool {
	_, err := e.Open(path)
	return err == nil
}

func EmbeddedFolder(fsEmbed embed.FS, targetPath string) static.ServeFileSystem {
	fsys, err := fs.Sub(fsEmbed, targetPath)
	if err != nil {
		panic(err)
	}
	return embeddedFileSystem{
		FileSystem: http.FS(fsys),
	}
}
