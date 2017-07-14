let promisify = (original, after) => {
  return (...originalArgs) => {
    return new Promise((resolve, reject) => {
      let callback = (...callbackArgs) => {
        resolve(...callbackArgs)
      }

      try {
        original(...originalArgs.concat([callback]))
      } catch(e) {
        reject(e)
      }
    }).then(after)
  }
}

chrome.browserAction.onClicked.addListener(async () => {
  let tabs = await promisify(chrome.tabs.query)({
    active: true,
    currentWindow: true
  })
  let tab = tabs[0]
  let scriptExec = promisify(chrome.tabs.executeScript, rs => rs[0]);
  let alert = (message) => {
    scriptExec({ code: `window.alert(${JSON.stringify(message)})` })
  }
  let options = await promisify(chrome.storage.sync.get)({
    developerMode: false
  });
  var j = {
    v: 3,
    u: tab.url,
    bi: []
  }

  let windowSelection = await scriptExec({ code: "window.getSelection().toString()" })
  j.q = windowSelection.slice(0, 2048)
  let title = await scriptExec({ code: "document.title" })
  if (title) j.t = title.slice(0, 2048)

  let extractionScript = () => {
    var result = {}
    var extractor = (tag_name, hash_key) => {
      let tags = Array.prototype.slice.call(document.querySelectorAll(tag_name));
      result[hash_key] = tags.map((el) => el.src).filter((src) => src && src.length < 2048 && !src.match(/^data:/))
    }

    extractor("img", "i")
    extractor("video", "vi")
    extractor("iframe", "ifr")
    extractor("audio", "au")

    result.bi = Array.prototype.map.call(document.querySelectorAll("*"), (el) => {
      window.getComputedStyle(el).backgroundImage
    }).filter((bi) => { bi && bi.match(/url\(.*\)/) })
    return result
  };
  let extracted = await scriptExec({ code: "(" + extractionScript.toString() + ")()" });
  j = Object.assign(j, extracted)

  let url = options.developerMode ? "http://mokum.dev:3000/sh" : "https://mokum.place/sh"
  console.log(`Pushing to ${url}`, j);
  let request = new XMLHttpRequest()
  try {
    request.open('POST', url, true)
  } catch (e) {
    alert(location.host + " disallows bookmarklets on its site, use extension")
  }

  request.setRequestHeader('Content-Type', 'application/json');

  request.onload = function() {
    if (request.status == 201) {
      chrome.tabs.update({
        url: request.responseText
      })
    } else {
      alert("HTTP " + request.statusText);
    }
  };

  request.onerror = function() {
    alert('Network error');
  };

  request.send(JSON.stringify(j));
});
