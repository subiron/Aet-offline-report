package main
//v. 1.0

import (
	//"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"os"
	"strings"
)

const apiRoot = "/api/";

const artifact = "artifact"
const metadata = "metadata"
const artifactUrl = apiRoot + artifact
const metadataUrl = apiRoot + metadata
const jsonExtension = ".json";

const reportDataFolder = "reportData/"
const static = "./static"
const reportUrlPart = "report.html?"
const port = ":3000"

func main() {
	argCount := len(os.Args)
	if argCount > 1 {
		cleatDataFolder()

		arg := os.Args[1]
		fmt.Println("Fetching report from: " + arg)
		downloadReport(arg)
	}
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir(static))))
	http.HandleFunc(metadataUrl, metadataHandler)
	http.HandleFunc(artifactUrl, artifactsHandler)
	log.Println("");
	log.Println("Go to:")
	log.Println("http://localhost" + port)
	log.Println("to access report")
	http.ListenAndServe(port, nil)
}
func cleatDataFolder() {
	if stat, err := os.Stat(reportDataFolder); err == nil && stat.IsDir() {

		fmt.Print("WARNING! Previously downloaded report will be deleted")
		fmt.Print("do you want to continue? [y/n]")
		var input string
		fmt.Scanln(&input)
		if input != "y" {
			os.Exit(0)
		}
		os.RemoveAll(reportDataFolder)
	}
	os.MkdirAll(reportDataFolder, os.ModeDir)
}

func downloadReport(url string) {
	cutPoint := strings.Index(url, reportUrlPart)
	prefix := url[:cutPoint]
	suffix := url[cutPoint + 11:]

	//download metadata
	downloadAsFile(prefix + metadataUrl + suffix, metadata + jsonExtension)

	ary := getAllIds(readLocalMatadata())
	//download artifacts
	for _, md5id := range ary {
		downloadAsFile(prefix + artifactUrl + suffix + "&id=" + md5id, md5id)
	}
}

func downloadAsFile(url string, fname string) {
	fmt.Println("Downloading: ", url)
	fname = reportDataFolder + fname
	output, err := os.Create(fname)
	if err != nil {
		fmt.Println("Error while creating", fname, "-", err)
		return
	}
	defer output.Close()

	response, err := http.Get(url)
	if err != nil {
		fmt.Println("Error while downloading", url, "-", err)
		return
	}
	defer response.Body.Close()

	n, err := io.Copy(output, response.Body)
	if err != nil {
		fmt.Println("Error while downloading", url, "-", err)
		return
	}

	fmt.Println(url, " downloaded ", n, " bytes.")
}

func getAllIds(metadatastring string) []string {
	re := regexp.MustCompile("[a-f0-9]{24}")
	return re.FindAllString(metadatastring, -1)
}

func metadataHandler(w http.ResponseWriter, r *http.Request) {
	str := readLocalMatadata();
	fmt.Fprintf(w, "%s", str)
}

func readLocalMatadata() string {
	b, err := ioutil.ReadFile(reportDataFolder + metadata + jsonExtension)
	if err != nil {
		fmt.Println("ReadLocalMatadata error:", err)
	}
	return string(b)
}

func artifactsHandler(w http.ResponseWriter, r *http.Request) {
	param1 := r.URL.Query().Get("id")
	b, err := ioutil.ReadFile(reportDataFolder + param1)
	if err != nil {
		fmt.Println("Artifactfunc error:", err)
	}
	str := string(b)
	fmt.Fprintf(w, "%s", str)
}