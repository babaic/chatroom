import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root",
})
export class MessageService {
  constructor(private http: HttpClient) {}

  baseUrl = environment.baseUrl+"/chat";
  youtubeUrl = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics';

  sendMsg(payload: any) {
    //let params = new HttpParams();
    //params = params.append("msg", message);

    //return this.http.post(this.baseUrl, message, {params, responseType: 'text'});
    return this.http.post(this.baseUrl, payload, {responseType: 'text'});
  }

  getYouTubeInfo(id: string){
    let params = new HttpParams();
    params = params.append('id', id);
    params = params.append('key', 'AIzaSyD3fRrsA4QVY7em9avCc1QIquRH11ya0yQ');
    return this.http.get(this.youtubeUrl, {params});
  }

}
