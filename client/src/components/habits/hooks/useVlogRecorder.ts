import { useState, useRef, useEffect, useCallback } from 'react';
import type { Vlog } from '../../../types';
import { DateUtility } from '../../../utils';
import { getVlogsBatch, saveVlog } from '../../../api/vlogs';

interface UseVlogRecorderProps {
  startDate: Date;
}

export function useVlogRecorder({ }: UseVlogRecorderProps) {
  const [vlogs, setVlogs] = useState<Map<string, Vlog>>(new Map());
  const [viewingVlog, setViewingVlog] = useState<Vlog | null>(null);
  const [loomSupported, setLoomSupported] = useState(false);
  
  const loomButtonRef = useRef<HTMLButtonElement | null>(null);
  const sdkButtonRef = useRef<any>(null);
  const recordingWeekRef = useRef<Date | null>(null);

  useEffect(() => {
    checkLoomSupport();
  }, []);

  async function checkLoomSupport() {
    try {
      const { isSupported } = await import('@loomhq/record-sdk/is-supported');
      const { supported } = await isSupported();
      setLoomSupported(supported);

      if (supported) {
        initializeLoom();
      }
    } catch (error) {
      console.error('Failed to check Loom support:', error);
      setLoomSupported(false);
    }
  }

  async function initializeLoom() {
    try {
      const { createInstance } = await import('@loomhq/record-sdk');
      const { oembed } = await import('@loomhq/loom-embed');

      const hiddenButton = document.createElement('button');
      hiddenButton.style.display = 'none';
      document.body.appendChild(hiddenButton);
      loomButtonRef.current = hiddenButton;

      const { configureButton } = await createInstance({
        mode: 'standard',
        publicAppId: 'fae3c61b-58d9-47dc-9cc8-c148e8d8dbaf',
      });

      const sdkButton = configureButton({ element: hiddenButton });
      sdkButtonRef.current = sdkButton;

      sdkButton.on('insert-click', async (video: any) => {
        if (!recordingWeekRef.current) {
          console.error('No recordingWeek set when insert-click fired');
          return;
        }

        try {
          const { html } = await oembed(video.sharedUrl, { width: 600 });
          await handleVlogSaved(recordingWeekRef.current, video.sharedUrl, html);
        } catch (err) {
          console.error('Failed to save vlog:', err);
        }
      });

      sdkButton.on('cancel', () => {
        recordingWeekRef.current = null;
      });

      sdkButton.on('complete', () => {
        recordingWeekRef.current = null;
      });
    } catch (error) {
      console.error('Failed to initialize Loom:', error);
      setLoomSupported(false);
    }
  }

  const loadVlogs = useCallback(async (dates: Date[]) => {
    const weeks = new Set<string>();
    dates.forEach(date => {
      if (date.getDay() === 6) {
        const weekStart = DateUtility.getWeekStart(date);
        weeks.add(DateUtility.formatDate(weekStart));
      }
    });

    try {
        const vlogsData = await getVlogsBatch(Array.from(weeks));
        const vlogsMap = new Map<string, Vlog>();
        Object.entries(vlogsData).forEach(([weekStart, vlog]) => {
        vlogsMap.set(weekStart, vlog as Vlog);
        });
        setVlogs(vlogsMap);
    } catch (error) {
        console.error("Failed to load vlogs", error)
    }
  }, []);

  async function handleVlogSaved(weekStart: Date, videoUrl: string, embedHtml: string) {
    const weekStartStr = DateUtility.formatDate(weekStart);
    const vlog: Vlog = { weekStartDate: weekStartStr, videoUrl, embedHtml };

    try {
      await saveVlog(vlog);
      const newVlogs = new Map(vlogs);
      newVlogs.set(weekStartStr, vlog);
      setVlogs(newVlogs);
      recordingWeekRef.current = null;
    } catch (error) {
      console.error('Failed to save vlog:', error);
    }
  }

  function handleVlogClick(weekStart: Date, e: React.MouseEvent) {
    e.stopPropagation();
    const weekStartStr = DateUtility.formatDate(weekStart);
    const vlog = vlogs.get(weekStartStr);

    if (vlog) {
      setViewingVlog(vlog);
    } else {
      recordingWeekRef.current = weekStart;
      if (loomButtonRef.current) {
        loomButtonRef.current.click();
      }
    }
  }

  return {
    vlogs,
    viewingVlog,
    setViewingVlog,
    loomSupported,
    handleVlogClick,
    loadVlogs
  };
}
