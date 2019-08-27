/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";


export interface ship {
    x: number;
    y: number;
    xSpeed: number;
    ySpeed: number;
    width: number;
    height: number;
    angle: number;
    zIndex: number;
    
}
export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;

    private imageUrl = "http://static.skaip.org/img/emoticons/180x180/f6fcff/unicorn.gif";
    private width: number = 180;
    private height: number = 180;
    private noOfShips: number = 15;
    private maxSpeed: number = 10;
    private ships: Array<ship> = new Array();
    private timer: number;
    


    public generateRandomNumber(min_value, max_value) {
        let random_number = Math.random() * (max_value - min_value) + min_value;
        return random_number;
    }

    private initialiseShips(target: HTMLElement) {

        //Width and Height of the visual
        var width = target.clientWidth;
        var height = target.clientHeight;

        //Initialise ships
        for (var n = 0; n < this.noOfShips; n++) {

            var xSpeed = 0;
            var ySpeed = 0;

            //Set a random speed in x and y directions for each ball between -maxSpeed and max Speed
            //that isn't 0
            if (this.maxSpeed != 0) {
                while (xSpeed == 0 || ySpeed == 0) {
                    xSpeed = this.generateRandomNumber((this.maxSpeed * -1), this.maxSpeed);
                    ySpeed = this.generateRandomNumber((this.maxSpeed * -1), this.maxSpeed);
                }
            }

            var sizeMultiplier = 1;

            //Set the properties of the ships
            this.ships.push({
                x: this.generateRandomNumber(0, width),
                y: this.generateRandomNumber(0, height),
                xSpeed: xSpeed,
                ySpeed: 0,
                width: this.width * sizeMultiplier,
                height: this.height * sizeMultiplier,
                angle: this.generateRandomNumber(0, 359),
                zIndex: Math.round(sizeMultiplier * 100)
            });
        
        }

        this.drawShips(target);

    }

    private drawShips(target: HTMLElement) {

        //iterate through each of the ships
        for (var n = 0; n < this.noOfShips; n++) {

            //find the ship image, if it doesn't exist create it 
            var img: HTMLImageElement = <HTMLImageElement>document.getElementById("ship" + n.toString());
            if (img ==null) {
                img = document.createElement("img");
                img.src = this.imageUrl;
                img.style.width = this.ships[n].width + "px";
                img.style.height = this.ships[n].height + "px";
                img.style.position = "absolute";
                img.style.zIndex = this.ships[n].zIndex.toString();
                img.id = "ship" + n.toString();
                target.appendChild(img);
            };

            //set the location of the ship
            img.style.left = this.ships[n].x + "px";
            img.style.top = this.ships[n].y + "px";

            //if the heading of ship changes, rotate the image
            if (img.style.transform != "rotate(" + (Math.round (this.ships[n].angle)).toString() + "deg)") {
                img.style.transform = "rotate(" + (Math.round (this.ships[n].angle)).toString() + "deg)";
                img.style.webkitTransition = "transform 0.5s";
    
            };

            //flip image when going right way
            if (this.ships[n].angle < 180) {
                img.style.transform = "scaleY(-1)";
            };
        
        }
    }
    
    private moveShips(target: HTMLElement) {

        for (var n = 0; n< this.noOfShips; n++)  {

            //calculate mqx X and Y coords taking into account width and height of image
            var maxY: number = target.clientHeight - this.ships[n].height;
            var maxX: number = target.clientWidth - this.ships[n].width;

            //Store current x and y coords
            var previousX = this.ships[n].x;
            var previousY = this.ships[n].y;

            ///Move ship by x and y speeds
            this.ships[n].x += this.ships[n].xSpeed;
            this.ships[n].y += this.ships[n].ySpeed;

            //If ship goes beyond right edge, move back to edge and reverse ship direction
            if (this.ships[n].x > maxX) {
                this.ships[n].xSpeed = this.ships[n].xSpeed * -1;
                this.ships[n].x = maxX;
            }

            //If ship goes beyond left edge, move back to edge and reverse ship direction
            if (this.ships[n].x < 0) {
                this.ships[n].xSpeed = this.ships[n].xSpeed * -1;
                this.ships[n].x = 0
            }

            //If ship goes beyond bottom edge, move back to edge and reverse ship direction
            if (this.ships[n].y > maxY) {
                this.ships[n].ySpeed = this.ships[n].ySpeed * -1;
                this.ships[n].y = maxY;
            }

             //If ship goes beyond top edge, move back to edge and reverse ship direction
             if (this.ships[n].y < 0) {
                this.ships[n].ySpeed = this.ships[n].ySpeed * -1;
                this.ships[n].y = 0
            }

             //Calculate heading based on previous and new coords
             var heading = (Math.atan2(this.ships[n].y - previousY, this.ships[n].x - previousX) / Math.PI * 180);
             this.ships[n].angle = heading;
        }

        this.drawShips(target);
    }

    private initTimer(target:HTMLElement) {
        if (this.timer !=null) {
            clearInterval(this.timer);
        }
        var visual = this
        this.timer = setInterval(function () {
            visual.moveShips(target);
        }, 50);
    }

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
      
        if (typeof document !== "undefined") {
        this.initialiseShips(this.target);
        this.initTimer(this.target);
        }
    }

    private removeUnusedUnicorns(previous, current) {
        if (current < previous) {
            for (var n=0; n < previous; n++) {
                var ship = document.getElementById('ship' + n);
                ship.parentElement.removeChild(ship);
            }
        }
    }


    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        
        var noOfShips = Number(options.dataViews[0].single.value);
        this.removeUnusedUnicorns(this.noOfShips,noOfShips);
        this.noOfShips = noOfShips;
        this.initialiseShips(this.target);

    
        
        
       
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}