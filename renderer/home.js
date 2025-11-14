(async () => {
  const ipc = window.electron
  const profileEl = document.getElementById('profile')
  const titleEl = document.getElementById('title')
  const skinImg = document.getElementById('skinImg')
  const launchBtn = document.getElementById('launchBtn')
  const logoutBtn = document.getElementById('logoutBtn')
  const settingsBtn = document.getElementById('settingsBtn')
  const accountSettingsBtn = document.getElementById('accountSettingsBtn')
  const settingsCard = document.getElementById('settingsCard')
  const closeSettingsBtn = document.getElementById('closeSettingsBtn')
  const downloadMinecraftBtn = document.getElementById('downloadMinecraftBtn')
  const downloadCard = document.getElementById('downloadCard')
  const closeDownloadBtn = document.getElementById('closeDownloadBtn')
  const downloadStatusText = document.getElementById('downloadStatusText')
  const downloadProgressBar = document.getElementById('downloadProgressBar')
  const downloadProgressPercent = document.getElementById('downloadProgressPercent')
  const installBtn = document.getElementById('installBtn')
  const modsInput = document.getElementById('modsInput')
  const modPackSelect = document.getElementById('modPackSelect')
  const installedModsList = document.getElementById('installedModsList')
  const installStatus = document.getElementById('installStatus')
  const installStatusText = document.getElementById('installStatusText')
  const progressBar = document.getElementById('progressBar')
  const progressPercent = document.getElementById('progressPercent')

  let saved
  try {
    saved = await ipc.invoke('load-login')
  } catch (e) {
    saved = null
  }

  if (!saved || !saved.profile) {
    window.location.href = 'index.html'
    return
  }

  const { profile, mc } = saved
  let skinUrl = ''
  try {
    skinUrl = `https://crafatar.com/avatars/${profile.id}?size=64`
    skinImg.src = skinUrl
  } catch (err) {
    console.error('Failed to load skin:', err)
  }

    const profileLink = document.getElementById('profileLink')
    const settingsModal = document.getElementById('settingsModal')
    const modalClose = document.getElementById('modalClose')
    const modalLogout = document.getElementById('modalLogout')
    const modalName = document.getElementById('modalName')
    const modalUUID = document.getElementById('modalUUID')
    const modalSkin = document.getElementById('modalSkin')

    function openSettingsModal() {
      if (!settingsModal) return
      modalName && (modalName.textContent = profile.name)
      modalUUID && (modalUUID.textContent = profile.id)
      modalSkin && (modalSkin.src = skinUrl)
      settingsModal.style.display = 'flex'
    }

    function closeSettingsModal() {
      if (!settingsModal) return
      settingsModal.style.display = 'none'
    }

    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        e.preventDefault()
        openSettingsModal()
      })
    }

    if (accountSettingsBtn) {
      accountSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault()
        openSettingsModal()
      })
    }

    if (modalClose) {
      modalClose.addEventListener('click', () => closeSettingsModal())
    }

    if (modalLogout) {
      modalLogout.addEventListener('click', async () => {
        try {
          await ipc.invoke('clear-login')
          window.location.href = 'index.html'
        } catch (err) {
          alert('Logout failed: ' + (err.message || String(err)))
        }
      })
    }

  async function loadInstalledMods() {
    try {
      const mods = await ipc.invoke('get-installed-mods')
      if (mods.length === 0) {
        installedModsList.innerHTML = '<p id="noModsText" style="color: #aaa; margin: 0;">No mods installed</p>'
      } else {
        installedModsList.innerHTML = mods.map((mod, idx) => `
          <div class="mod-item">
            <span style="flex: 1; text-align: left; font-size: 13px;">${mod.name}</span>
            <button class="remove-btn" data-mod-index="${idx}" onclick="window.removeMod(event, '${mod.name}')">Remove</button>
          </div>
        `).join('')
      }
    } catch (err) {
      console.error('Failed to load mods:', err)
    }
  }

  window.removeMod = async (event, modName) => {
    event.preventDefault()
    if (!confirm(`Remove ${modName}?`)) return
    try {
      await ipc.invoke('remove-mod', { modName })
      await loadInstalledMods()
    } catch (err) {
      alert('Failed to remove mod: ' + err.message)
    }
  }

  async function loadModPacks() {
    try {
      const packs = await ipc.invoke('get-mod-packs')
    } catch (err) {
      console.error('Failed to load mod packs:', err)
    }
  }

  if (modPackSelect) {
    modPackSelect.addEventListener('change', async (e) => {
    const packId = e.target.value
    if (packId === '' || packId === 'vanilla') {
      modsInput.value = ''
    } else {
      alert(`Mod pack "${packId}" selected. Add mods manually or they will be pre-configured.`)
    }
    })
  }

  if (settingsBtn && settingsCard) {
    settingsBtn.addEventListener('click', async () => {
      settingsCard.style.display = settingsCard.style.display === 'none' ? 'block' : 'none'
      if (settingsCard.style.display === 'block') {
        await loadInstalledMods()
      }
    })
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsCard.style.display = 'none'
    })
  }

  if (downloadMinecraftBtn) {
    downloadMinecraftBtn.addEventListener('click', async () => {
    downloadCard.style.display = 'block'
    downloadStatusText.textContent = 'Starting Minecraft 1.12.2 download...'
    downloadStatusText.style.color = '#eee'
    downloadProgressBar.style.width = '0%'
    downloadProgressPercent.textContent = '0%'
    downloadMinecraftBtn.disabled = true
    downloadMinecraftBtn.textContent = 'Downloading...'

    try {
      const res = await ipc.invoke('download-minecraft', { version: '1.12.2' })
      if (res.ok) {
        downloadStatusText.textContent = res.message
        downloadStatusText.style.color = '#9f9'
        downloadProgressBar.style.width = '100%'
        downloadProgressPercent.textContent = '100%'
        setTimeout(() => {
          downloadCard.style.display = 'none'
          downloadMinecraftBtn.textContent = 'Download 1.12.2'
          downloadMinecraftBtn.disabled = false
        }, 2000)
      } else {
        downloadStatusText.textContent = 'Download failed: ' + (res.message || 'Unknown error')
        downloadStatusText.style.color = '#f99'
        downloadMinecraftBtn.textContent = 'Download 1.12.2'
        downloadMinecraftBtn.disabled = false
      }
    } catch (err) {
      downloadStatusText.textContent = 'Error: ' + (err.message || String(err))
      downloadStatusText.style.color = '#f99'
      downloadMinecraftBtn.textContent = 'Download 1.12.2'
      downloadMinecraftBtn.disabled = false
    }
    })
  }

  if (closeDownloadBtn) {
    closeDownloadBtn.addEventListener('click', () => {
      downloadCard.style.display = 'none'
    })
  }

  ipc.on('install-progress', (event, data) => {
    if (data.status === 'downloading-minecraft') {
      downloadStatusText.textContent = 'Downloading Minecraft launcher...'
      downloadProgressBar.style.width = data.progress + '%'
      downloadProgressPercent.textContent = data.progress + '%'
    } else if (data.status === 'minecraft-ready') {
      downloadStatusText.textContent = 'Minecraft launcher ready!'
      downloadStatusText.style.color = '#9f9'
      downloadProgressBar.style.width = '100%'
      downloadProgressPercent.textContent = '100%'
    } else if (data.status === 'downloading-forge') {
      installStatusText.textContent = 'Downloading Forge...'
      progressBar.style.width = data.progress + '%'
      progressPercent.textContent = data.progress + '%'
    } else if (data.status === 'installing-forge') {
      installStatusText.textContent = 'Installing Forge (running installer)...'
      progressBar.style.width = data.progress + '%'
      progressPercent.textContent = data.progress + '%'
    } else if (data.status.includes('downloading-mod')) {
      installStatusText.textContent = `Downloading: ${data.modName}`
      progressBar.style.width = data.progress + '%'
      progressPercent.textContent = data.progress + '%'
    } else if (data.status === 'complete') {
      installStatusText.textContent = 'Installation complete!'
      progressBar.style.width = '100%'
      progressPercent.textContent = '100%'
      installStatusText.style.color = '#9f9'
      setTimeout(() => {
        installStatus.style.display = 'none'
        installBtn.textContent = 'Install Forge + Mods'
        installBtn.disabled = false
        installStatusText.style.color = '#eee'
        loadInstalledMods()
      }, 2000)
    } else if (data.status === 'error') {
      installStatusText.textContent = `Error: ${data.error}`
      installStatusText.style.color = '#f99'
    }
  })

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
    try {
      installBtn.disabled = true
      installBtn.textContent = 'Installing...'
      installStatus.style.display = 'block'
      progressBar.style.width = '0%'
      progressPercent.textContent = '0%'

      const modsText = modsInput.value.trim()
      const modsUrls = modsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('http://') || line.startsWith('https://')))

      installStatusText.textContent = 'Starting installation...'

      const res = await ipc.invoke('install-forge-mods', { modsUrls })

      if (res.ok) {
        installStatusText.textContent = res.message + ` (${modsUrls.length} mods)`
        installStatusText.style.color = '#9f9'
        setTimeout(() => {
          installBtn.textContent = 'Install Forge + Mods'
          installBtn.disabled = false
          installStatus.style.display = 'none'
          installStatusText.style.color = '#eee'
          loadInstalledMods()
        }, 3000)
      } else {
        installStatusText.textContent = 'Installation failed'
        installStatusText.style.color = '#f99'
        installBtn.textContent = 'Install Forge + Mods'
        installBtn.disabled = false
      }
    } catch (err) {
      installStatusText.textContent = 'Error: ' + (err.message || String(err))
      installStatusText.style.color = '#f99'
      installBtn.textContent = 'Install Forge + Mods'
      installBtn.disabled = false
    }
    })
  }

  if (launchBtn) {
    launchBtn.addEventListener('click', async () => {
    try {
      launchBtn.disabled = true
      launchBtn.textContent = 'Launching...'
      // Step 1: Ensure Minecraft client is downloaded
      try {
        installBtn && (installBtn.disabled = true)
        installStatus && (installStatus.style.display = 'block')
        installStatusText && (installStatusText.textContent = 'Downloading Minecraft (if needed)...')
        progressBar && (progressBar.style.width = '0%')
        progressPercent && (progressPercent.textContent = '0%')

        const dlRes = await ipc.invoke('download-minecraft', { version: '1.12.2' })
        if (!dlRes || !dlRes.ok) {
          throw new Error((dlRes && dlRes.message) || 'Download failed')
        }
        installStatusText && (installStatusText.textContent = 'Minecraft ready — installing Forge...')
      } catch (err) {
        console.warn('Minecraft download failed:', err)
        alert('Failed to download Minecraft 1.12.2: ' + (err.message || String(err)))
        launchBtn.textContent = 'Launch Minecraft'
        launchBtn.disabled = false
        installBtn && (installBtn.disabled = false)
        return
      }

      // Step 2: Ensure Forge (and optional mods) are installed
      try {
        const installRes = await ipc.invoke('install-forge-mods', { modsUrls: [] })
        if (!installRes || !installRes.ok) {
          throw new Error((installRes && installRes.message) || 'Forge installation failed')
        }
      } catch (err) {
        console.warn('Forge install failed:', err)
        alert('Failed to install Forge: ' + (err.message || String(err)))
        launchBtn.textContent = 'Launch Minecraft'
        launchBtn.disabled = false
        installBtn && (installBtn.disabled = false)
        return
      } finally {
        installBtn && (installBtn.disabled = false)
      }

      const res = await ipc.invoke('launch', {
        mcProfile: profile,
        accessToken: mc.access_token
      })
      console.log('Launch result:', res)
      
      if (res.ok) {
        launchBtn.textContent = 'Minecraft Launched!'
        setTimeout(() => {
          launchBtn.textContent = 'Launch Minecraft'
          launchBtn.disabled = false
        }, 3000)
      } else {
        alert('Launch failed:\n\n' + res.message + '\n\n' + JSON.stringify(res.instructions, null, 2))
        launchBtn.textContent = 'Launch Minecraft'
        launchBtn.disabled = false
      }
    } catch (err) {
      alert('Launch error: ' + (err.message || String(err)))
      launchBtn.textContent = 'Launch Minecraft'
      launchBtn.disabled = false
    }
    })
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true
      logoutBtn.textContent = 'Logging out...'
      try {
        await ipc.invoke('clear-login')
        window.location.href = 'index.html'
      } catch (err) {
        alert('Logout failed: ' + (err.message || String(err)))
        logoutBtn.textContent = 'Logout'
        logoutBtn.disabled = false
      }
    })
  }

  await loadModPacks()

})()
