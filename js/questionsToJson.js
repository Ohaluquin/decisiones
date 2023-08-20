function saveQuestionsToJson(questions) {
    // Convert the questions array to a JSON string
    const jsonString = JSON.stringify(questions, null, 2);
  
    // Create a blob with the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
  
    // Create a download link for the JSON file
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'questions.json';
  
    // Append the link to the document and click it to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
  
    // Clean up by removing the link
    document.body.removeChild(downloadLink);
  }
  