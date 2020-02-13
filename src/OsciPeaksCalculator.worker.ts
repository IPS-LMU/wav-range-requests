// import { MathHelperService } from './math-helper.service';

export class OsciPeaksCalculator {

  /**
   *
   */
  public static calculateOsciPeaks(audioBuffer: AudioBuffer) {
    let sampleRate = audioBuffer.sampleRate;
    let numberOfChannels = audioBuffer.numberOfChannels;

    // TODO mix all channels

    // calculate 3 peak levels (inspired by http://www.reaper.fm/sdk/reapeaks.txt files)
    //   1. At approximately 400 peaks/sec (divfactor 110 at 44khz)
    let winSize0 = sampleRate / 400;
    //   2. At approximately 10 peaks/sec (divfactor 4410 at 44khz)
    let winSize1 = sampleRate / 10;
    //   3. At approximately 1 peaks/sec (divfactor 44100 at 44khz)
    let winSize2 = sampleRate / 1;

    // set initial result values
    const peaksArray: Array<any> = [];
    const osciPeaks = {
      'numberOfChannels': numberOfChannels,
      'sampleRate': sampleRate,
      'winSizes': [winSize0, winSize1, winSize2],
      'channelOsciPeaks': peaksArray
    };


    //////////////////////////
    // go through channels

    for(let channelIdx = 0; channelIdx < numberOfChannels; channelIdx++){

      let curChannelSamples = audioBuffer.getChannelData(channelIdx);

      // preallocate min max peaks arrays
      let curChannelMaxPeaksWinSize0 = new Float32Array(Math.round(audioBuffer.length / winSize0));
      let curChannelMinPeaksWinSize0 = new Float32Array(Math.round(audioBuffer.length / winSize0));

      let curChannelMaxPeaksWinSize1 = new Float32Array(Math.round(audioBuffer.length / winSize1));
      let curChannelMinPeaksWinSize1 = new Float32Array(Math.round(audioBuffer.length / winSize1));

      let curChannelMaxPeaksWinSize2 = new Float32Array(Math.round(audioBuffer.length / winSize2));
      let curChannelMinPeaksWinSize2 = new Float32Array(Math.round(audioBuffer.length / winSize2));

      let curWindowIdxCounterWinSize0 = 0;
      let curPeakIdxWinSize0 = 0;
      let winMinPeakWinSize0 = Infinity;
      let winMaxPeakWinSize0 = -Infinity;

      let curWindowIdxCounterWinSize1 = 0;
      let curPeakIdxWinSize1 = 0;
      let winMinPeakWinSize1 = Infinity;
      let winMaxPeakWinSize1 = -Infinity;

      let curWindowIdxCounterWinSize2 = 0;
      let curPeakIdxWinSize2 = 0;
      let winMinPeakWinSize2 = Infinity;
      let winMaxPeakWinSize2 = -Infinity;


      for(let sampleIdx = 0; sampleIdx <= curChannelSamples.length; sampleIdx++){

        ///////////////////////////
        // check if largest/smallest in window

        // winSize0
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize0){
          winMaxPeakWinSize0 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize0){
          winMinPeakWinSize0 = curChannelSamples[sampleIdx];
        }

        // winSize1
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize1){
          winMaxPeakWinSize1 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize1){
          winMinPeakWinSize1 = curChannelSamples[sampleIdx];
        }

        // winSize2
        if(curChannelSamples[sampleIdx] > winMaxPeakWinSize2){
          winMaxPeakWinSize2 = curChannelSamples[sampleIdx];
        }

        if(curChannelSamples[sampleIdx] < winMinPeakWinSize2){
          winMinPeakWinSize2 = curChannelSamples[sampleIdx];
        }

        ////////////////////////////
        // add to peaks array

        // winSize0
        if(curWindowIdxCounterWinSize0 === Math.round(winSize0)){
          curChannelMaxPeaksWinSize0[curPeakIdxWinSize0] = winMaxPeakWinSize0;
          curChannelMinPeaksWinSize0[curPeakIdxWinSize0] = winMinPeakWinSize0;
          curPeakIdxWinSize0 += 1;
          // reset win vars
          curWindowIdxCounterWinSize0 = 0;
          winMinPeakWinSize0 = Infinity;
          winMaxPeakWinSize0 = -Infinity;
        }

        // winSize1
        if(curWindowIdxCounterWinSize1 === Math.round(winSize1)){
          curChannelMaxPeaksWinSize1[curPeakIdxWinSize1] = winMaxPeakWinSize1;
          curChannelMinPeaksWinSize1[curPeakIdxWinSize1] = winMinPeakWinSize1;
          curPeakIdxWinSize1 += 1;
          // reset win vars
          curWindowIdxCounterWinSize1 = 0;
          winMinPeakWinSize1 = Infinity;
          winMaxPeakWinSize1 = -Infinity;
        }

        // winSize2
        if(curWindowIdxCounterWinSize2 === Math.round(winSize2)){
          curChannelMaxPeaksWinSize2[curPeakIdxWinSize2] = winMaxPeakWinSize2;
          curChannelMinPeaksWinSize2[curPeakIdxWinSize2] = winMinPeakWinSize2;
          curPeakIdxWinSize2 += 1;
          // reset win vars
          curWindowIdxCounterWinSize2 = 0;
          winMinPeakWinSize2 = Infinity;
          winMaxPeakWinSize2 = -Infinity;
        }

        curWindowIdxCounterWinSize0 += 1;
        curWindowIdxCounterWinSize1 += 1;
        curWindowIdxCounterWinSize2 += 1;
      }

      osciPeaks.channelOsciPeaks[channelIdx] = {
        'maxPeaks': [curChannelMaxPeaksWinSize0, curChannelMaxPeaksWinSize1, curChannelMaxPeaksWinSize2],
        'minPeaks': [curChannelMinPeaksWinSize0, curChannelMinPeaksWinSize1, curChannelMinPeaksWinSize2]
      };

    }

    return osciPeaks;
  }


  /**
   * get current peaks to be drawn
   * if drawing over sample exact -> samples
   * if multiple samples per pixel -> calculate envelope points
   * @param canvas canvas object used to get width
   * @param data samples as arraybuffer
   * @param sS start sample
   * @param eS end sample
   */
  // public static calculatePeaks = function (canvas, data, sS, eS) {

  //   let samplePerPx = (eS + 1 - sS) / canvas.width; // samples per pixel + one to correct for subtraction
  //   // var numberOfChannels = 1; // hardcode for now...
  //   // init result values for over sample exact
  //   let samples = [];
  //   let minSamples;
  //   let maxSamples;
  //   // init result values for envelope
  //   let maxPeaks: any = {};
  //   let minPeaks: any = {};
  //   let minMinPeak = Infinity;
  //   let maxMaxPeak = -Infinity;

  //   let winStartSample;
  //   let winEndSample;
  //   let winMinPeak = Infinity;
  //   let winMaxPeak = -Infinity;

  //   let relData;

  //   if (samplePerPx <= 1) {
  //     // check if view at start
  //     if (sS === 0) {
  //       relData = data.subarray(sS, eS + 2); // +2 to compensate for length
  //     } else {
  //       relData = data.subarray(sS - 1, eS + 2); // +2 to compensate for length
  //     }

  //     minSamples = Math.min.apply(Math, relData);
  //     maxSamples = Math.max.apply(Math, relData);
  //     samples = Array.prototype.slice.call(relData);

  //   } else {

  //     relData = data.subarray(sS, eS);
  //     // preallocate arraybuffer
  //     maxPeaks = new Float32Array(canvas.width);
  //     minPeaks = new Float32Array(canvas.width);

  //     for (let curPxIdx = 0; curPxIdx < canvas.width; curPxIdx++) {
  //       //for (var c = 0; c < numberOfChannels; c++) {
  //       // get window arround current pixel
  //       winStartSample = curPxIdx * samplePerPx - samplePerPx/2;
  //       winEndSample = curPxIdx * samplePerPx + samplePerPx/2;
  //       if(winStartSample < 0){ // at start of file the won't have the full length (other option would be left padding)
  //         winStartSample = 0;
  //       }
  //       let vals = relData.subarray(winStartSample, winEndSample);

  //       // var sum = 0;
  //       winMinPeak = Infinity;
  //       winMaxPeak = -Infinity;
  //       for (let p = 0; p < vals.length; p++) {
  //         if(vals[p] > winMaxPeak){
  //           winMaxPeak = vals[p];
  //         }

  //         if(vals[p] < winMinPeak){
  //           winMinPeak = vals[p];
  //         }

  //         // sum += vals[p];
  //       }
  //       // avrVal = sum / vals.length;
  //       //}

  //       maxPeaks[curPxIdx] = winMaxPeak;
  //       minPeaks[curPxIdx] = winMinPeak;
  //       if (winMaxPeak > maxMaxPeak) {
  //         maxMaxPeak = winMaxPeak;
  //       }
  //       if (winMinPeak < minMinPeak) {
  //         minMinPeak = winMinPeak;
  //       }
  //     }
  //   } //else

  //   return {
  //     'samples': samples,
  //     'minSample': minSamples,
  //     'maxSample': maxSamples,
  //     'minPeaks': minPeaks,
  //     'maxPeaks': maxPeaks,
  //     'minMinPeak': minMinPeak,
  //     'maxMaxPeak': maxMaxPeak,
  //     'samplePerPx': samplePerPx
  //   };
  // };


  // public static findMinMaxPeaks(sS, eS, winIdx, audioBuffer: AudioBuffer, osciPeaks) {

  //   const ssT = this.getTimeOfSample(sS, audioBuffer.sampleRate).end;
  //   const esT = this.getTimeOfSample(eS, audioBuffer.sampleRate).end;

  //   // calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
  //   let pps = osciPeaks.sampleRate / osciPeaks.winSizes[winIdx];

  //   let startPeakWinIdx = ssT * pps;
  //   let endPeakWinIdx = esT * pps;

  //   let minMinPeak = Infinity;
  //   let maxMaxPeak = -Infinity;

  //   for(let i = Math.round(startPeakWinIdx); i < Math.round(endPeakWinIdx); i++){
  //     if (osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i] > maxMaxPeak) {
  //       maxMaxPeak = osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i];
  //     }
  //     if (osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i] < minMinPeak) {
  //       minMinPeak = osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i];
  //     }
  //   }

  //   return {
  //     // 'minPeaks': sServObj.osciPeaks.channelOsciPeaks[0].minPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
  //     // 'maxPeaks': sServObj.osciPeaks.channelOsciPeaks[0].maxPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
  //     'minMinPeak': minMinPeak,
  //     'maxMaxPeak': maxMaxPeak
  //   };

  // }

  // ////////////////////////
  // // private functions
  // private getTimeOfSample(targetSample: number, sampleRate: number): { start: number, center: number, end: number } {
  //   let startOfSample = (targetSample - 0.5) / sampleRate;
  //   const centerOfSample = targetSample / sampleRate;
  //   const endOfSample = (targetSample + 0.5) / sampleRate;

  //   if (targetSample === 0) {
  //     startOfSample = 0;
  //   }

  //   return {
  //     start: startOfSample,
  //     center: centerOfSample,
  //     end: endOfSample
  //   };
  // }
}