/**
 * <pre>
 * Listens to HELP_COMMAND and displays notifications.
 * Provides interactive tutorial for first time users.
 * </pre>
 * 
 * @constructor
 * @param {mindmaps.EventBus} eventBus
 * @param {mindmaps.commandRegistry} commandRegistry
 */
mindmaps.HelpController = function(eventBus, commandRegistry) {

  /**
   * Prepare tutorial guiders.
   */
  function setupInteractiveMode() {
    if (isTutorialDone()) {
      console.debug("skipping tutorial");
      return;
    }

    var notifications = [];
    var interactiveMode = true;

    // start tutorial after a short delay
    eventBus.once(mindmaps.Event.DOCUMENT_OPENED, function() {
      setTimeout(start, 1000);
    });

    function closeAllNotifications() {
      notifications.forEach(function(n) {
        n.close();
      });
    }

    var helpMain, helpRoot;
    function start() {
      helpMain = new mindmaps.Notification(
          "#toolbar",
          {
            position : "bottomMiddle",
            maxWidth : 550,
            title : "欢迎使用思维导图",
            content : "Hello，看来你是新来的！这些气泡将引导您学会怎么用。或者 <a class='skip-tutorial link'>点击这里<a/>跳过引导。"
          });
      notifications.push(helpMain);
      helpMain.$().find("a.skip-tutorial").click(function() {
        interactiveMode = false;
        closeAllNotifications();
        tutorialDone();
      });
      setTimeout(theRoot, 2000);
    }

    function theRoot() {
      if (isTutorialDone())
        return;

      helpRoot = new mindmaps.Notification(
          ".node-caption.root",
          {
            position : "bottomMiddle",
            closeButton : true,
            maxWidth : 350,
            title : "这是你开始的地方 - 你的第一个Idea",
            content : "双击节点更改内容。这将是你思维导图的主题。"
          });
      notifications.push(helpRoot);

      eventBus.once(mindmaps.Event.NODE_TEXT_CAPTION_CHANGED, function() {
        helpRoot.close();
        setTimeout(theNub, 900);
      });
    }

    function theNub() {
      if (isTutorialDone())
        return;

      var helpNub = new mindmaps.Notification(
          ".node-caption.root",
          {
            position : "bottomMiddle",
            closeButton : true,
            maxWidth : 350,
            padding : 20,
            title : "创建新的Idea",
            content : "现在你可以开始思维风暴了<br/> 鼠标移动到节点上，点击然后拖拽"
                + "这个<span style='color:red'>红点</span>就可以创建新的分支了。"
          });
      notifications.push(helpNub);
      eventBus.once(mindmaps.Event.NODE_CREATED, function() {
        helpMain.close();
        helpNub.close();
        setTimeout(newNode, 900);
      });
    }

    function newNode() {
      if (isTutorialDone())
        return;

      var helpNewNode = new mindmaps.Notification(
          ".node-container.root > .node-container:first",
          {
            position : "bottomMiddle",
            closeButton : true,
            maxWidth : 350,
            title : "创建第一个分支",
            content : "完美! 是不是很简单？红点点是你最重要的工具。现在你可以通过拖动节点或双击修改文本。"
          });
      notifications.push(helpNewNode);
      setTimeout(inspector, 2000);

      eventBus.once(mindmaps.Event.NODE_MOVED, function() {
        helpNewNode.close();
        setTimeout(navigate, 0);
        setTimeout(toolbar, 15000);
        setTimeout(menu, 10000);
        setTimeout(tutorialDone, 20000);
      });
    }

    function navigate() {
      if (isTutorialDone())
        return;

      var helpNavigate = new mindmaps.Notification(
          ".float-panel:has(#navigator)",
          {
            position : "bottomRight",
            closeButton : true,
            maxWidth : 350,
            expires : 10000,
            title : "导航预览",
            content : "您可以单击并拖动小地图的背景来进行移动，还可以使用鼠标滚轮或滑块放大和缩小。"
          });
      notifications.push(helpNavigate);
    }

    function inspector() {
      if (isTutorialDone())
        return;

      var helpInspector = new mindmaps.Notification(
          "#inspector",
          {
            position : "leftBottom",
            closeButton : true,
            maxWidth : 350,
            padding : 20,
            title : "不喜欢这个颜色?",
            content : "使用这些控件来更改节点的外观。尝试单击右上角的图标可以最小化面板。"
          });
      notifications.push(helpInspector);
    }

    function toolbar() {
      if (isTutorialDone())
        return;

      var helpToolbar = new mindmaps.Notification(
          "#toolbar .buttons-left",
          {
            position : "bottomLeft",
            closeButton : true,
            maxWidth : 350,
            padding : 20,
            title : "工具栏",
            content : "鼠标悬停可以看到快捷键"
          });
      notifications.push(helpToolbar);
    }

    function menu() {
      if (isTutorialDone())
        return;

      var helpMenu = new mindmaps.Notification(
          "#toolbar .buttons-right",
          {
            position : "leftTop",
            closeButton : true,
            maxWidth : 350,
            title : "保存",
            content : "点击鼠标右键可以打开菜单，可以进行保存导出等操作"
          });
      notifications.push(helpMenu);
    }

    function isTutorialDone() {
      return mindmaps.LocalStorage.get("mindmaps.tutorial.done") == 1;
    }

    function tutorialDone() {
      mindmaps.LocalStorage.put("mindmaps.tutorial.done", 1);
    }

  }

  /**
   * Prepares notfications to show for help command.
   */
  function setupHelpButton() {
    var command = commandRegistry.get(mindmaps.HelpCommand);
    command.setHandler(showHelp);

    var notifications = [];
    function showHelp() {
      // true if atleast one notifications is still on screen
      var displaying = notifications.some(function(noti) {
        return noti.isVisible();
      });

      // hide notifications if visible
      if (displaying) {
        notifications.forEach(function(noti) {
          noti.close();
        });
        notifications.length = 0;
        return;
      }

      // show notifications
      var helpRoot = new mindmaps.Notification(
          ".node-caption.root",
          {
            position : "bottomLeft",
            closeButton : true,
            maxWidth : 350,
            title : "这是主题",
            content : "双击节点更改内容。鼠标移动到节点上，点击然后拖拽"
            + "这个<span style='color:red'>红点</span>就可以创建新的分支了。"
          });

      var helpNavigator = new mindmaps.Notification(
          "#navigator",
          {
            position : "leftTop",
            closeButton : true,
            maxWidth : 350,
            padding : 20,
            title : "导航预览",
            content : "您可以单击并拖动小地图的背景来进行移动，还可以使用鼠标滚轮或滑块放大和缩小。"
          });

      var helpInspector = new mindmaps.Notification(
          "#inspector",
          {
            position : "leftTop",
            closeButton : true,
            maxWidth : 350,
            padding : 20,
            title : "这是属性编辑",
            content : "使用这些控件来更改节点的外观。尝试单击右上角的图标可以最小化面板。"
          });

      var helpToolbar = new mindmaps.Notification(
          "#toolbar .buttons-left",
          {
            position : "bottomLeft",
            closeButton : true,
            maxWidth : 350,
            title : "这是工具栏",
            content : "鼠标悬停可以看到快捷键"
          });

      notifications.push(helpRoot, helpNavigator, helpInspector,
          helpToolbar);
    }
  }

  setupInteractiveMode();
  setupHelpButton();
};
