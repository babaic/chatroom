import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { MessageService } from '../_services/message.service';
import { NgForm } from '@angular/forms';
import { error } from 'console';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subscribable, Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';

interface DummyData{
  username: string;
  message: string;
}

interface MessagesFromFirebase extends DummyData{
}

interface YouTube{
  videoTitle: string;
}



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  @ViewChild("messageBox", { static: false })
  private myScrollContainer: ElementRef;
  dummyMsg: DummyData[] = [];
  messagesFromFirebase: MessagesFromFirebase[] = [];

  message: string;
  videoid: string;
  videourl: SafeResourceUrl;
  dangerousVideoUrl: string;
  connectionToDestroy: signalR.HubConnection;
  htmlContent:string;
  username = prompt('Please enter your name.');
  subs: Subscription;
  lastvideo: Subscription;
  videoInfo: YouTube;
  title: any;
  
  


  constructor(private messageService : MessageService, public sanitizer : DomSanitizer, public db : AngularFireDatabase) { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit() {
    if(this.username == null || this.username.length<3){
      this.username = "anonymous-"+Math.random().toString().slice(2,11);
    }

    if(this.dummyMsg == null || this.dummyMsg.length == 0){
      this.getLastTenMessagesFromFirebase();
    }

    if(this.title == null){
      this.getLastYoutubeVideoFromFirebase();
    }

    //signal r
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl("http://localhost:57566/notify")
      .build();

    connection
      .start()
      .then(function() {
        console.log("Connected!");
        console.log("connection ", connection);

        connection.invoke("getConnectionId").then(function(connectionId) {
          console.log("coid ", connectionId);
          // Send the connectionId to controller
        });

        connection.invoke('JoinGroup', "group1");

      })
      .catch(function(err) {
        return console.error(err.toString());
      });

    connection.on("BroadcastMessage", (type: string, payload: any) => {
      console.log("message ", payload);
      this.dummyMsg.push({message:payload.message, username: payload.username});
      this.playAudio();
      this.message = '';
  
    });

    this.connectionToDestroy = connection;

    //connection 2
    const connection2 = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl("http://localhost:57566/videohub")
      .build();

    connection2
      .start()
      .then(function() {
        console.log("Connected 2!");
        console.log("connection 2", connection2);

        connection2.invoke("getConnectionId").then(function(connectionId) {
          console.log("coid ", connectionId);
          // Send the connectionId to controller
        });

        connection2.invoke('JoinGroup', "group1");

      })
      .catch(function(err) {
        return console.error(err.toString());
      });

    connection2.on("UpdateVideo", (type: string, videoid: string) => {
      console.log("message ", videoid);

      this.loadYoutubeVideo(videoid);
      this.insertYoutubeVideoToFirebase(videoid);

      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + videoid+'?autoplay=1';
      this.videourl =
      this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    });

    this.connectionToDestroy = connection2;

  }

  sendMsg(event){
    if (event.keyCode === 13) {
      let payload: DummyData = {message: this.message, username: this.username};
      this.messageService.sendMsg(payload).subscribe(()=>{
        this.insertMessagesToFirebase(this.username, payload.message);
      }, error =>{
        console.log('error');
      }, ()=>{
        this.scrollToBottom();
      })
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/clearly.mp3";
    audio.load();
    audio.play();
  }

  getLastTenMessagesFromFirebase(){
    this.subs = this.db.list('items', x=> x.limitToLast(10)).valueChanges().pipe(first()).subscribe((result: MessagesFromFirebase[]) =>{
      this.messagesFromFirebase = result;
    });
  }

  getLastYoutubeVideoFromFirebase(){
    this.lastvideo = this.db.list('videos', x=> x.limitToLast(1)).valueChanges().pipe(first()).subscribe((result: any) =>{
      console.log('last video ', result[0].videoid)
      this.loadYoutubeVideo(result[0].videoid);
      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + result[0].videoid+'?autoplay=1';
      this.videourl =
      this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    });
  }

  insertMessagesToFirebase(username: string, message: string){
    this.db.list('items').push({username: username, message: message});
  }

  insertYoutubeVideoToFirebase(videoid:string){
    this.db.list('videos').push({videoid: videoid});
  }

  loadYoutubeVideo(videoid: any){
    this.messageService.getYouTubeInfo(videoid).subscribe((result: any) =>{
      // this.videoInfo.videoTitle = result.items[0].snippet.title;
      this.title = result.items[0].snippet.title;
      this.dummyMsg.push({message:'Now playing: '+this.title, username: 'YouTube'});
      
      console.log('youtube info ', result.items[0].snippet.title);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.lastvideo.unsubscribe();
  }

}
