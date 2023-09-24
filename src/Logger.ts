import { openiap } from "@openiap/nodeapi";
import { Context, HrTime, Span, TraceFlags } from "@opentelemetry/api";
export class Logger {
    public static instrumentation: iinstrumentation = null;
    public static log_message: ilog_message = null;
    public static init() {
        let _instrumentation_require: any = null;
        try {
            _instrumentation_require = require("./instrumentation");
        } catch (error) {
        }
        if (_instrumentation_require != null && Logger.instrumentation == null) {
            Logger.instrumentation = _instrumentation_require.instrumentation;
            Logger.log_message = _instrumentation_require.log_message;
        } else {
        }

    }
}
Logger.init();
export interface iinstrumentation {
    init(client:openiap): void;
    addMeterURL(url: string): void;
    addTraceURL(url: string): void;
    setparent(traceId: string, spanId: string, traceFlags: TraceFlags): Context;
}
export interface log_message_node {
    constructor(nodeid: string);
    startspan(parentspan: Span, msgid): void;
}
export interface ilog_message {
    traceId: string;
    spanId: string;
    log_messages: { [key: string]: ilog_message; }
    constructor(msgid: string): void;
    nodeexpire(msgid: string, nodeid: string): void;
    nodeend(msgid: string, nodeid: string): void;
    nodestart(msgid: string, nodeid: string): log_message_node;
    GetTraceSpanId(span: Span): [string, string];
    hrTimeSubtract(hrtimestamp: any, end: any): HrTime;
}
