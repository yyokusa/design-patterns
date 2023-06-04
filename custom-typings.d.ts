declare module "design-patterns-in-typescript" {
    class File {
        name: Path;
        constructor(name: Path);
        open(): void;
        close(): void;
        write(message?: string): void;
    }

    interface Path {
        path: string;
    }

    class System {
        email(email: string, message: string): void;
    }
}