(() => {
    'use strict'
    // const componentId = "bmd_style_ref";
    // if (!document.getElementById(componentId)) {
    //     const component = document.createElement("link");
    //     component.href = Root + "components/dialog/dialog.css";
    //     component.id = componentId;
    //     component.rel = "stylesheet";
    //     document.head.appendChild(component);
    // }
})()
class DialogTypes {
    static Success = 0;
    static Error = 1;
    static Question = 2;
    static Progress = 3;
    static Info = 4;
    static ActivityIndicator = 5;
}
export default class Dialog {
    constructor(content, title, type) {
        if (typeof Root === undefined) {
            throw new DOMException("undefined variable Root");
        }
        this.uniqueId = (new Date()).getTime();
        this.getOSName();
        this.content = content;
        if (Object.values(DialogTypes).includes(title)) {
            this.mode = title;
            this.title = "";
        }
        else {
            this.mode = type ?? DialogTypes.Info;
            this.title = title;
        }
        this.legacySupport = false;
        this.prefixEvent = ".sem-dialog";
        this.doneButtonText = "Aceptar";
        this.cancelButtonText = "Cancelar";
        this.keyboard = type != DialogTypes.Question;
        this.colorScheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
        document.removeEventListener("keydown", this.handleKeyboard);
        document.addEventListener("keydown", this.handleKeyboard);
        // this.UI.addCSS();
        this.UI.drawOverlay();
    }
    static type = {
        success: DialogTypes.Success,
        error: DialogTypes.Error,
        progress: DialogTypes.Progress,
        question: DialogTypes.Question
    }
    handleKeyboard = e => {
        if (e.keyCode == 27 && this.keyboard) {
            //dismiss dialog
            if (this.mode != DialogTypes.Progress) {
                Dialog.hide();
            }
        }
        else if (e.keyCode == 27 && !this.keyboard) {
            //alert("esc");
            const arrayDialogs = document.getElementsByClassName("bm-dialog-content");
            if (arrayDialogs.length) {
                for (let i = 0; i < arrayDialogs.length; i++) {
                    arrayDialogs[i].classList.add("bm-dialog-focus");
                }
                setTimeout(() => {
                    for (let i = 0; i < arrayDialogs.length; i++) {
                        arrayDialogs[i].classList.remove("bm-dialog-focus");
                    }
                }, 150);
            }
        }
    }
    getOSName = () => {
        if (window.navigator.userAgent.indexOf("Windows NT 10.0") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) this.OSName = "windows";
        if (window.navigator.userAgent.indexOf("Android") != -1) this.OSName = "android";
        if (window.navigator.userAgent.indexOf("Mac") != -1) this.OSName = "macos";
        if (window.navigator.userAgent.indexOf("iPad") != -1) this.OSName = "macos";
        if (window.navigator.userAgent.indexOf("X11") != -1) this.OSName = "ios";
        if (window.navigator.userAgent.indexOf("Linux") != -1) this.OSName = "ios";
    }
    OSName = "windows"
    isOpen = false
    uniqueId = 0
    handleDone = e => {
        const dialogId = this.uniqueId;
        if (this.legacySupport) {
            //legacy
            this.callEvent("done");
        }
        Dialog.hide(dialogId);
        this.on.done(e);
    }
    handleCancel = e => {
        const dialogId = this.uniqueId;
        if (this.legacySupport) {
            //legacy
            this.callEvent("cancel");
        }
        Dialog.hide(dialogId);
        this.on.cancel(e);
    }
    callEvent = eName => {
        if (window.jQuery) {
            $(this.prefixEvent).trigger(eName);
        }
    }
    on = {
        done: e => { },
        cancel: e => { }
    }
    static show = (Content, Title, Type) => {
        Dialog.hide();
        const newDialog = new Dialog(Content, Title, Type);
        newDialog.legacySupport = true;
        newDialog.open();
    }
    open = () => {
        Dialog.remove();
        document.body.classList.add("bm-dialog-open");
        this.UI.drawDialog();
    }
    static remove = () => {
        const bmDialogs = document.getElementsByTagName("bmdialog");
        if (bmDialogs.length > 0) {
            for (let index = bmDialogs.length - 1; index >= 0; index--) {
                bmDialogs[index].parentNode.removeChild(bmDialogs[index]);
            }
        }
    }
    static hide = refId => {
        const bmOverlays = document.getElementsByTagName("bmdoverlay");
        if (bmOverlays.length > 0) {
            for (let index = bmOverlays.length - 1; index >= 0; index--) {
                bmOverlays[index].parentNode.removeChild(bmOverlays[index]);
            }
        }
        if (refId != undefined && document.getElementById(refId)) {
            document.getElementById(refId).remove();
        }
        else {
            Dialog.remove()
        }
    }
    UI = {
        drawDialog: () => {
            const component = document.createElement("bmdialog");
            component.id = this.uniqueId;
            component.classList.add("bm-dialog");
            component.classList.add(this.prefixEvent.replace(".", "").replace("#", ""));
            component.classList.add(this.OSName);
            component.classList.add(this.colorScheme);
            const componentContent = document.createElement("bmdcontent");
            componentContent.classList.add("bm-dialog-content");
            if (this.mode == DialogTypes.ActivityIndicator) {
                componentContent.classList.add("activity-mode");
            }
            const dialogHeader = this.UI.createDialogHeader();
            const dialogBody = this.UI.createDialogBody();
            const dialogFooter = this.UI.createDialogFooter();
            if (dialogHeader != null && this.mode != DialogTypes.ActivityIndicator) {
                componentContent.appendChild(dialogHeader);
            }
            if (dialogHeader == null && dialogBody != null) {
                dialogBody.classList.add("nt-header");
            }
            if (dialogBody != null) {
                componentContent.appendChild(dialogBody);
            }
            if (dialogFooter != null && (this.mode != DialogTypes.Progress && this.mode != DialogTypes.ActivityIndicator)) {
                componentContent.appendChild(dialogFooter);
            }
            component.appendChild(componentContent);
            document.body.appendChild(component);
            const buttonDone = document.querySelector(".bm-dialog-button-done")
            if (buttonDone != null) {
                buttonDone.focus()
            }
        },
        createDialogHeader: () => {
            const Title = this.title;
            if (Title != undefined && Title.toString().trim() != "") {
                const dialogHeader = document.createElement("bmdheader");
                dialogHeader.innerHTML = Title;
                dialogHeader.className = "bm-dialog-header";
                return dialogHeader;
            }
            return null;
        },
        createLoadingSpin: () => {
            const loadingSpin = document.createElement("div");
            loadingSpin.className = "bm-dialog-loader";
            const svgSpin = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgSpin.classList.add("spn-container");
            svgSpin.classList.add("colors");
            svgSpin.setAttribute("viewBox", "0 0 44 44");
            const circleSpin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleSpin.classList.add("path");
            circleSpin.setAttributeNS(null, "cx", 22);
            circleSpin.setAttributeNS(null, "cy", 22);
            circleSpin.setAttributeNS(null, "r", 20);
            circleSpin.setAttributeNS(null, "fill", "none");
            circleSpin.setAttributeNS(null, "stroke-width", 4);
            svgSpin.appendChild(circleSpin);
            loadingSpin.appendChild(svgSpin);
            return loadingSpin;
        },
        createActivityIndicatorIOS: () => {
            const activityHolder = document.createElement("div");
            activityHolder.classList.add("bm-dialog-ios-activity-indicator");
            for (let i = 1; i < 13; i++) {
                const activitySpintItem = document.createElement("div");
                activitySpintItem.classList.add("bm-dialog-ios-activity-indicator-spin-item");
                activitySpintItem.classList.add("bar" + i);
                activityHolder.appendChild(activitySpintItem);
            }
            return activityHolder;
        },
        createContentHolder: Content => {
            const contentHolder = document.createElement("div");
            contentHolder.classList.add("bm-dialog-body-text");
            contentHolder.innerHTML = Content;
            return contentHolder;
        },
        createDialogBody: () => {
            const Content = this.content;
            if (Content.toString().trim() != "") {
                const dialogBody = document.createElement("bmdbody");
                dialogBody.classList.add("bm-dialog-body");
                //create loading
                if (this.mode == DialogTypes.Progress || this.mode == DialogTypes.ActivityIndicator) {
                    const loadingSpin = this.OSName == "macos" ? this.UI.createActivityIndicatorIOS() :
                        this.OSName == "ios" ? this.UI.createActivityIndicatorIOS() : this.UI.createLoadingSpin();
                    dialogBody.appendChild(loadingSpin);
                    dialogBody.appendChild(this.UI.createContentHolder(Content));
                }
                else {
                    dialogBody.innerHTML = Content;
                }
                return dialogBody;
            }
            return null;
        },
        createDialogFooter: () => {
            const Content = this.content;
            if (Content.toString().trim() != "") {
                const dialogFooter = document.createElement("bmdfooter");
                dialogFooter.classList.add("bm-dialog-footer");
                dialogFooter.classList.add(this.mode);
                if (this.mode == DialogTypes.Success || this.mode == DialogTypes.Error || this.mode == DialogTypes.Info) {
                    dialogFooter.appendChild(this.UI.Buttons.createDoneButton());
                }
                if (this.mode == DialogTypes.Question) {
                    dialogFooter.appendChild(this.UI.Buttons.createCancelButton());
                    dialogFooter.appendChild(this.UI.Buttons.createDoneButton());
                }

                return dialogFooter;
            }
            return null;
        },
        Buttons: {
            createDoneButton: buttonText => {
                const doneButton = document.createElement("button");
                doneButton.innerHTML = buttonText ?? this.doneButtonText;
                doneButton.className = "bm-dialog-button-done";
                doneButton.setAttribute("data-dialog-ref", this.uniqueId);
                doneButton.addEventListener("click", this.handleDone)
                return doneButton;
            },
            createCancelButton: buttonText => {
                const cancelButton = document.createElement("button");
                cancelButton.innerHTML = buttonText ?? this.cancelButtonText;
                cancelButton.className = "bm-dialog-button-cancel";
                cancelButton.setAttribute("data-dialog-ref", this.uniqueId);
                cancelButton.addEventListener("click", this.handleCancel)
                return cancelButton;
            }
        },
        drawOverlay: () => {
            const component = document.createElement("bmdoverlay");
            component.id = "bmo-dl-20884";
            component.classList.add("bm-dialog-overlay");
            component.classList.add(this.colorScheme);
            component.classList.add(this.OSName);
            if (!document.getElementsByTagName("bmdoverlay").length) {
                document.body.appendChild(component);
            }
        }
    }
}