import { http, HttpRequest, HttpRequestMethod } from '@minecraft/server-net';
export async function report(name: string, data: unknown): Promise<void> {
   const request = new HttpRequest('http://localhost:29132/report/' + name);
   request.setMethod(HttpRequestMethod.Post);
   request.setBody(JSON.stringify(data, null, 3));
   await http.request(request);
}
export async function exit(): Promise<void> {
   const request = new HttpRequest('http://localhost:29132/exit/');
   request.setMethod(HttpRequestMethod.Post);
   request.setBody(JSON.stringify({}));
   await http.request(request);
}
