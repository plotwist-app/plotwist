import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { CannotParseXMLError } from '../errors/cannot-convert-xml-to-json'

export function convertXmlToJson<T>(xmlContent: string): T {
  const isValidXML = XMLValidator.validate(xmlContent)
  if (!isValidXML) {
    throw new CannotParseXMLError()
  }

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    parseTagValue: true,
  }

  const parser = new XMLParser(options)
  return parser.parse(xmlContent)
}
