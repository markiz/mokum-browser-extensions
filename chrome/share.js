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
  let scriptExec = promisify(chrome.tabs.executeScript, rs => rs[0])
  let alert = (message) => {
    scriptExec({ code: `window.alert(${JSON.stringify(message)})` })
  }
  let options = await promisify(chrome.storage.sync.get)({
    developerMode: false
  })
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
    var extractor = (tagName, attrName) => {
      let tags = Array.prototype.slice.call(document.querySelectorAll(tagName))
      return tags.map((el) => el[attrName]).filter((attr) => attr && attr.length < 8192 && !attr.match(/^data:/)).slice(0, 100)
    }


    let bgImgs = Array.prototype.map.call(document.querySelectorAll("*"), (el) => {
      window.getComputedStyle(el).backgroundImage
    }).filter((bi) => { bi && bi.match(/url\(.*\)/) }).slice(0, 100)

    return {
      i: extractor("img", "src"),
      vi: extractor("video", "src"),
      ifr: extractor("iframe", "src"),
      au: extractor("audio", "src"),
      ss: [
        ...extractor("img", "srcset"),
        ...extractor("source", "srcset")
      ],
      bi: bgImgs
    }
  }

  let extracted = await scriptExec({ code: "(" + extractionScript.toString() + ")()" })
  j = Object.assign(j, extracted)

  let url = options.developerMode ? "http://mok.um:3000/sh" : "https://mokum.place/sh"
  console.log(`Pushing to ${url}`, j)
  let request = new XMLHttpRequest()
  try {

    request.open('POST', url, true)
  } catch (e) {
    alert(location.host + " disallows bookmarklets on its site, use extension")
  }

  request.setRequestHeader('Content-Type', 'application/json')

  request.onload = function() {
    if (request.status == 201) {
      chrome.tabs.update({
        url: request.responseText
      })
    } else {
      alert(`HTTP ${request.status}`)
    }
  }

  request.onerror = function() {
    alert('Network error')
  }

  request.send(JSON.stringify(j))
})
