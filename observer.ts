import { Path, File, System } from "design-patterns-in-typescript";
// Observer is a behavioral design pattern that lets you define
//  a subscription mechanism to notify multiple objects about 
// any events that happen to the object they’re observing.


// The object that has some interesting state is often called subject, 
// but since it’s also going to notify other objects about 
// the changes to its state, we’ll call it publisher. 
// All other objects that want to track changes to 
// the publisher’s state are called subscribers.

interface Listener {
    update(data: any): void;
}

// The base publisher class includes subscription management
// code and notification methods.
class EventManager {
    private listeners: Map<string, Listener[]> = new Map();

    subscribe(eventType: string, listener: Listener) {
        const eventListeners = this.listeners.get(eventType) || [];
        this.listeners.set(eventType, [...eventListeners, listener]);
    }

    unsubscribe(eventType: string, listener: Listener) {
        const eventListeners = this.listeners.get(eventType) || [];
        this.listeners.set(eventType, eventListeners.filter(l => l !== listener));
    }

    notify(eventType: string, data: any) {
        for (const listener of this.listeners.get(eventType) ?? []) {
            listener.update(data)
        }
    }
}

// The concrete publisher contains real business logic that's
// interesting for some subscribers. We could derive this class
// from the base publisher, but that isn't always possible in
// real life because the concrete publisher might already be a
// subclass. In this case, you can patch the subscription logic
// in with composition, as we did here.
class Editor {
    public events: EventManager;
    private file: File;

    constructor() {
        this.events = new EventManager()
    }
    // Methods of business logic can notify subscribers about
    // changes.
    openFile(path: Path) {
        this.file = new File(path);
        this.events.notify("open", this.file.name)
    }

    saveFile() {
        this.file.write()
        this.events.notify("save", this.file.name)
    }
}


// Here's the subscriber interface. If your programming language
// supports functional types, you can replace the whole
// subscriber hierarchy with a set of functions.
interface EventListener {
    update(): void;
}

// Concrete subscribers react to updates issued by the publisher
// they are attached to.
class LoggingListener implements EventListener {
    private log: File;
    private message: string;

    constructor(log_filename: Path, message: string) {
        this.log = new File(log_filename);
        this.message = message;
    }

    update() {
        this.log.write(this.message);
    }
}


class EmailAlertsListener implements EventListener {
    private emailAddress: string
    private message: string
    private system: System

    constructor (emailAddress: string, message: string) {
        this.emailAddress = emailAddress
        this.message = message
        this.system = new System();
    }
    
    update() {
        this.system.email(this.emailAddress, this.message);
    }
}


// An application can configure publishers and subscribers at
// runtime.
class Application {
    editor: Editor;
    logger: LoggingListener;
    emailAlerts: EmailAlertsListener;
    config() {
        this.editor = new Editor()
    
        this.logger = new LoggingListener(
            "/path/to/log.txt" as unknown as Path,
            "Someone has opened the file: %s")
        this.editor.events.subscribe("open", this.logger)

        this.emailAlerts = new EmailAlertsListener(
            "admin@example.com",
            "Someone has changed the file: %s")
        this.editor.events.subscribe("save", this.emailAlerts)
    }
}

const app = new Application()
app.config()
app.editor.openFile("/path/to/file.txt" as unknown as Path)
app.editor.saveFile()
app.editor.events.unsubscribe("save", app.emailAlerts)
app.editor.events.unsubscribe("open", app.logger)