import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { MessageService } from "../_services/message.service";
import { NgForm } from "@angular/forms";
import { error } from "console";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable, Subscribable, Subscription } from "rxjs";
import { first, take } from "rxjs/operators";
import { Key } from "protractor";
import { stringify } from 'querystring';

interface DummyData {
  username: string;
  message: string;
}

interface MessagesFromFirebase extends DummyData {}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  @ViewChild("messageBox", { static: false })

  private myScrollContainer: ElementRef;
  dummyMsg: DummyData[] = [];
  messagesFromFirebase: MessagesFromFirebase[] = [];

  message: string;
  videourl: SafeResourceUrl;
  dangerousVideoUrl: string;
  username: string;
  subs: Subscription;
  lastvideo: Subscription;
  videoInfo: any;
  title: any;
  formVideo: any;
  keyToStart: any;

  constructor(
    private messageService: MessageService,
    public sanitizer: DomSanitizer,
    public db: AngularFireDatabase
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async ngOnInit() {
    this.setUserName();
    this.scrollToBottom();

    this.keyToStart = await this.getKey();

    this.getLiveMessagesFromFirebase();
    this.getLastYoutubeVideoFromFirebase();
  }
  setUserName() {
    let _username = prompt("Please enter your name.");

    if (
      _username == null ||
      _username.length < 3 ||
      _username.toUpperCase() == "YOUTUBE"
    ) {
      this.username = "anonymous-" + Math.random().toString().slice(2, 11);
    }
    else{
      this.username = _username;
    }
  }

  //Get key of last 10th child of items
  getKey() {
    return this.db.database
      .ref("items/")
      .ref.once("value")
      .then(function (snapshot) {
        var key = Object.keys(snapshot.val())[snapshot.numChildren() - 10];
        return key;
      });
  }

  sendMsg(event) {
    if (event.keyCode === 13) {
      if(this.message != null && this.message.trim() !== ''){
        this.insertMessagesToFirebase(this.username, this.message);
        this.scrollToBottom();
        this.message = null;
      }
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  playAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/clearly.mp3";
    audio.load();
    audio.play();
  }

  getLiveMessagesFromFirebase() {
    this.subs = this.db
      .list("items", (x) => x.orderByKey().startAt(this.keyToStart))
      .valueChanges()
      .subscribe((result: MessagesFromFirebase[]) => {
        this.messagesFromFirebase = result;
      });
  }

  getLastYoutubeVideoFromFirebase() {
    this.lastvideo = this.db
      .list("videos")
      .valueChanges()
      .subscribe((result: any[]) => {
        this.videoInfo = result[result.length - 1].videoid;
        this.loadYoutubeVideoInfo(this.videoInfo);
        this.dangerousVideoUrl =
          "https://www.youtube.com/embed/" + this.videoInfo + "?autoplay=1";
        this.videourl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.dangerousVideoUrl
        );
      });
  }

  insertMessagesToFirebase(username: string, message: string) {
    this.db.list("items").push({ username: username, message: message });
  }

  insertYoutubeVideoToFirebase(form: NgForm) {
    let videoid = this.youtube_parser(form.value.formVideo);
    this.db.list("videos").push({ videoid: videoid });

    this.messageService.getYouTubeInfo(videoid).subscribe((result: any) => {
      this.title = result.items[0].snippet.title;
      this.db
        .list("items")
        .push({ username: "YouTube", message: "Now playing: " + this.title });
    });

    this.formVideo = "";
  }

  loadYoutubeVideoInfo(videoid: any) {
    this.messageService.getYouTubeInfo(videoid).subscribe((result: any) => {
      this.title = result.items[0].snippet.title;
      return result.items[0].snippet.title;
    });
  }

  youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }
}
