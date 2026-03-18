export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendMail(to: string, subject: string, html: string): Promise<any>;
}
