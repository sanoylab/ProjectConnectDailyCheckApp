import { Component, ViewChild } from '@angular/core';
import { IonAccordionGroup } from '@ionic/angular';
import { ActivatedRoute, Router } from "@angular/router";
import { SchoolService } from '../services/school.service';
import { LoadingService } from '../services/loading.service';
import { StorageService } from '../services/storage.service';
import { NetworkService } from '../services/network.service';

import { School } from '../models/models';
import { Device } from '@capacitor/device';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-confirmschool',
  templateUrl: 'confirmschool.page.html',
  styleUrls: ['confirmschool.page.scss'],
})
export class ConfirmschoolPage {
  @ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup;
  school: any;
  schoolId: any;
  selectedCountry: any;
  detectedCountry: any;
  sub: any;
  constructor(
    private activatedroute: ActivatedRoute, 
    public router: Router,
    private schoolService: SchoolService,
    private storage: StorageService,
    private networkService: NetworkService, 

    public loading: LoadingService,
    private datePipe:DatePipe
  ) {
    this.sub = this.activatedroute.params.subscribe(params => {
      this.schoolId = params.schoolId;
      this.selectedCountry = params.selectedCountry;
      this.detectedCountry = params.detectedCountry;
      if(this.router.getCurrentNavigation()){
        this.school = this.router.getCurrentNavigation().extras.state as School;
      }      
    });   
  }
  
  confirmSchool(){
    /* Store school id and giga id inside storage */
    let schoolData = {};
    let flaggedSchoolData = {};
    let today = this.datePipe.transform(new Date(), 'yyyy-MM-ddah:mm:ssZZZZZ');
    this.networkService.getAccessInformation().subscribe(c => {
      this.getDeviceInfo().then(a => {
        this.getDeviceId().then(b => {
          schoolData = {
            giga_id_school: this.school.giga_id_school,
            mac_address: b.uuid,
            os: a.operatingSystem,
            app_version: "1.0.0",
            created: today,
            ip_address: c.ip,
            //country_code: c.country,
            country_code: this.selectedCountry,
            school_id: this.school.school_id
          };
          
    // if(this.school.code === c.country){
            this.schoolService.registerSchoolDevice(schoolData).subscribe((response) => {
              this.storage.set('deviceType', a.operatingSystem);
              this.storage.set('macAddress', b.uuid);
              this.storage.set('schoolUserId', response);
              this.storage.set('schoolId', this.schoolId);
              this.storage.set('gigaId', this.school.giga_id_school);
              this.storage.set('ip_address', c.ip);
              //this.storage.set('country_code', c.country);
              this.storage.set('country_code', this.selectedCountry);
              this.storage.set('school_id', this.school.school_id);
              this.storage.set('schoolInfo', JSON.stringify(this.school));
              this.loading.dismiss();
              this.router.navigate(['/schoolsuccess']);
            }), (err) => {
              this.loading.dismiss();
              this.router.navigate(['schoolnotfound', this.schoolId, this.selectedCountry, this.detectedCountry]);
              /* Redirect to no result found page */
            }
console.log('confirm', this.selectedCountry, this.detectedCountry)

            if(this.selectedCountry !== this.detectedCountry){
              flaggedSchoolData = {
                detected_country: this.detectedCountry,
                selected_country: this.selectedCountry,
                school_id: this.school.school_id,              
                created: today,
                giga_id_school: this.school.giga_id_school                
              };
              console.log('flagged', flaggedSchoolData)
              this.schoolService.registerFlaggedSchool(flaggedSchoolData).subscribe((response) => {
                this.storage.set('detectedCountry', this.detectedCountry);
                this.storage.set('selectedCountry', this.selectedCountry);              
                this.storage.set('schoolId', this.schoolId);                
                //this.loading.dismiss();
               // this.router.navigate(['/schoolsuccess']);
              }), (err) => {
                this.loading.dismiss();
                //this.router.navigate(['schoolnotfound', this.schoolId, this.selectedCountry, this.detectedCountry]);
                /* Redirect to no result found page */
              }

            }

    //}
    //else{

           
          //   this.loading.dismiss();
          //   this.router.navigate(['invalidlocation', 
          //   this.schoolId, 
          //      this.school.country,
          //      c.country + " (" +c.city + ")"
            
          //  ]);

    //}
          
        });
      })
    });
  }

  async getDeviceInfo(){
    const info = await Device.getInfo();
    return info;
  }

  async getDeviceId(){
    const deviceId = await Device.getId();
    return deviceId;
  }
}
