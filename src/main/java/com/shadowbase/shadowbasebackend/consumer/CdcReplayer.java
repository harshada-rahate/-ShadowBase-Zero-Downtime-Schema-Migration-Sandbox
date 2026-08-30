package com.shadowbase.shadowbasebackend.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class CdcReplayer {
	 @KafkaListener(
		        topics = "shadowbase.public.customers",
		        groupId = "shadowbase-replayer"
		    )
		    public void consume(String message) {

		        System.out.println("CDC Event Received:");
		        System.out.println(message);
		    }
}
